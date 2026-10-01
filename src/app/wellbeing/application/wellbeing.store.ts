import {computed, DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin, Observable, retry} from 'rxjs';
import {WellbeingApi} from '../infrastructure/wellbeing-api';
import {Device} from '../domain/model/device.entity';
import {DeviceCode} from '../domain/model/device-code';
import {DeviceStatus} from '../domain/model/device-status';
import {EnvironmentalReading} from '../domain/model/environmental-reading.entity';
import {HealthIndicator} from '../domain/model/health-indicator';
import {MetricThreshold} from '../domain/model/metric-threshold.entity';
import {MetricType} from '../domain/model/metric-type';
import {MetricValue} from '../domain/model/metric-value';
import {Office} from '../domain/model/office.entity';
import {OfficeLocation} from '../domain/model/office-location';
import {ThresholdRange} from '../domain/model/threshold-range.entity';
import {DeviceResource} from '../infrastructure/devices-response';
import {OfficeResource} from '../infrastructure/offices-response';

export interface DashboardMetric {
    metricType:MetricType;
    value:number|null;
    unit:string;
    indicator:HealthIndicator|null;
    recordedAt:string|null;
}
export interface DashboardOffice {
    office:Office;
    metrics:DashboardMetric[];
    overallIndicator:HealthIndicator|'NO_DATA';
}

@Injectable({providedIn:'root'})
export class WellbeingStore {
    private readonly destroyRef=inject(DestroyRef);
    private readonly api=inject(WellbeingApi);
    private readonly officesSignal=signal<Office[]>([]);
    private readonly devicesSignal=signal<Device[]>([]);
    private readonly readingsSignal=signal<EnvironmentalReading[]>([]);
    private readonly thresholdsSignal=signal<MetricThreshold[]>([]);
    private readonly loadingSignal=signal(false);
    private readonly errorSignal=signal<string|null>(null);

    readonly offices=this.officesSignal.asReadonly();
    readonly devices=this.devicesSignal.asReadonly();
    readonly readings=this.readingsSignal.asReadonly();
    readonly thresholds=this.thresholdsSignal.asReadonly();
    readonly loading=this.loadingSignal.asReadonly();
    readonly error=this.errorSignal.asReadonly();

    readonly activeOffices=computed(()=>this.offices().filter(o=>o.active));
    readonly inventoryDevices=computed(()=>this.devices().filter(d=>d.status==='IN_INVENTORY'));

    constructor(){
        this.loadAll();
    }

    loadAll():void{
        this.loadingSignal.set(true);
        this.errorSignal.set(null);
        forkJoin({
            offices:this.api.getOffices(),
            devices:this.api.getDevices(),
            readings:this.api.getReadings(),
            thresholds:this.api.getThresholds(),
            ranges:this.api.getThresholdRanges()
        }).pipe(
            retry(2),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next:({offices,devices,readings,thresholds,ranges})=>{
                this.officesSignal.set(offices);
                this.devicesSignal.set(devices);
                this.readingsSignal.set(readings);
                this.thresholdsSignal.set(this.combineThresholds(thresholds,ranges));
                this.reconnectDevices();
                this.loadingSignal.set(false);
            },
            error:error=>{
                this.errorSignal.set(error instanceof Error?error.message:'wellbeing.errors.load');
                this.loadingSignal.set(false);
            }
        });
    }

    clearError():void{
        this.errorSignal.set(null);
    }

    dashboardOffices():DashboardOffice[]{
        return this.offices().filter(o=>o.active).map(office=>{
            const metrics=(['TEMPERATURE','ILLUMINATION','AIR_QUALITY'] as MetricType[]).map(metricType=>{
                const reading=this.latestReading(office.id,metricType,false);
                const threshold=this.thresholdFor(metricType);
                const indicator=reading&&threshold?reading.classify(threshold):null;
                return{
                    metricType,
                    value:reading?.measurement.value??null,
                    unit:new MetricValue(metricType,reading?.measurement.value??this.defaultValue(metricType)).unit(),
                    indicator,
                    recordedAt:reading?.recordedAt??null
                };
            });
            const indicators=metrics.map(m=>m.indicator).filter((i):i is HealthIndicator=>i!==null);
            return{office,metrics,overallIndicator:this.worstIndicator(indicators)};
        });
    }

    latestReading(officeId:number,metricType:MetricType,onlyRecent=true):EnvironmentalReading|undefined{
        return this.readings().filter(r=>r.officeId===officeId&&r.measurement.metricType===metricType).filter(r=>!onlyRecent||r.isRecent(6)).sort((a,b)=>b.recordedAt.localeCompare(a.recordedAt))[0];
    }

    readingsForHistory(officeId:number,metricType:MetricType,start:Date,end:Date):EnvironmentalReading[]{
        return this.readings().filter(r=>r.officeId===officeId&&r.measurement.metricType===metricType).filter(r=>{
            const date=new Date(r.recordedAt);
            return date>=start&&date<=end;
        }).sort((a,b)=>a.recordedAt.localeCompare(b.recordedAt));
    }

    thresholdFor(metricType:MetricType):MetricThreshold|undefined{
        return this.thresholds().find(t=>t.metricType===metricType);
    }

    createOffice(props:{name:string;building:string;floor:string;reference:string}):void{
        if(this.offices().some(o=>o.name.toLowerCase()===props.name.trim().toLowerCase())){
            this.errorSignal.set('wellbeing.office-dialog.duplicate');
            throw new Error('DUPLICATE');
        }
        const location=new OfficeLocation({building:props.building,floor:props.floor,reference:props.reference});
        const resource:Omit<OfficeResource,'id'>={name:props.name.trim(),building:location.building,floor:location.floor,locationReference:location.reference,active:true};
        this.mutate(()=>this.api.createOffice(resource),created=>{
            this.officesSignal.update(items=>[...items,created]);
        });
    }

    updateOffice(office:Office):void{
        this.mutate(()=>this.api.updateOffice(office),updated=>{
            this.officesSignal.update(items=>items.map(current=>current.id===updated.id?updated:current));
            this.reconnectDevices();
        });
    }

    createAndLinkDevice(code:string,metrics:MetricType[],officeId:number):void{
        const normalized=code.trim().toUpperCase();
        if(this.devices().some(d=>d.code.value===normalized))throw new Error('DUPLICATE_DEVICE');
        const resource:Omit<DeviceResource,'id'>={code:normalized,officeId,supportedMetrics:metrics,status:'LINKED'};
        this.mutate(()=>this.api.createDevice(resource),created=>{
            this.devicesSignal.update(items=>[...items,created]);
            this.reconnectDevices();
        });
    }

    linkDevice(device:Device,officeId:number):void{
        const existingOwner=this.devices().find(current=>current.id===device.id)?.officeId;
        if(device.status==='LINKED'&&existingOwner!==officeId){
            this.errorSignal.set('wellbeing.device-dialog.already-linked');
            throw new Error('DEVICE_LINKED');
        }
        const updated=new Device({id:device.id,code:device.code,supportedMetrics:device.supportedMetrics,status:'LINKED',officeId});
        this.mutate(()=>this.api.updateDevice(updated),resource=>{
            this.devicesSignal.update(items=>items.map(current=>current.id===resource.id?resource:current));
            this.reconnectDevices();
        });
    }

    unlinkDevice(device:Device):void{
        const updated=new Device({id:device.id,code:device.code,supportedMetrics:device.supportedMetrics,status:'IN_INVENTORY',officeId:null});
        this.mutate(()=>this.api.updateDevice(updated),resource=>{
            this.devicesSignal.update(items=>items.map(current=>current.id===resource.id?resource:current));
            this.reconnectDevices();
        });
    }

    updateThreshold(id:number,ranges:{indicator:HealthIndicator;minValue:number;maxValue:number}[]):void{
        const threshold=this.thresholds().find(item=>item.id===id);
        if(!threshold)throw new Error('THRESHOLD_NOT_FOUND');
        const updatedRanges=ranges.map((range,index)=>new ThresholdRange({id:threshold.ranges[index]?.id??0,metricThresholdId:id,indicator:range.indicator,minValue:range.minValue,maxValue:range.maxValue}));
        const updatedThreshold=new MetricThreshold(id,threshold.metricType,updatedRanges);
        const resources=ranges.map(range=>({healthIndicator:range.indicator,minValue:range.minValue,maxValue:range.maxValue}));
        this.mutate(()=>this.api.updateThresholdRanges(id,resources),()=>this.thresholdsSignal.update(items=>items.map(current=>current.id===id?updatedThreshold:current)));
    }

    isStale(officeId:number):boolean{
        const readings=this.readings().filter(r=>r.officeId===officeId);
        return readings.length>0&&!readings.some(r=>r.isRecent(6));
    }

    private mutate<T>(request:()=>Observable<T>,onSuccess:(value:T)=>void):void{
        this.loadingSignal.set(true);
        this.errorSignal.set(null);
        request().pipe(
            retry(2),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next:value=>{
                onSuccess(value);
                this.loadingSignal.set(false);
            },
            error:error=>{
                this.errorSignal.set(error instanceof Error?error.message:'wellbeing.errors.generic');
                this.loadingSignal.set(false);
            }
        });
    }

    private reconnectDevices():void{
        const byOffice=new Map<number,Device[]>();
        this.devices().forEach(d=>{
            if(d.officeId!==null){
                const list=byOffice.get(d.officeId)??[];
                list.push(d);
                byOffice.set(d.officeId,list);
            }
        });
        this.officesSignal.set(this.offices().map(o=>new Office({id:o.id,name:o.name,location:o.location,active:o.active,devices:byOffice.get(o.id)??[]})));
    }

    private worstIndicator(indicators:HealthIndicator[]):HealthIndicator|'NO_DATA'{
        if(!indicators.length)return'NO_DATA';
        const priority:Record<HealthIndicator,number>={OPTIMAL:1,ACCEPTABLE:2,POOR:3,HAZARDOUS:4};
        return indicators.reduce((worst,current)=>priority[current]>priority[worst]?current:worst,indicators[0]);
    }

    private defaultValue(metric:MetricType):number{
        return metric==='TEMPERATURE'?0:1;
    }

    private combineThresholds(thresholds:MetricThreshold[],ranges:ThresholdRange[]):MetricThreshold[]{
        return thresholds.map(t=>new MetricThreshold(t.id,t.metricType,ranges.filter(r=>r.metricThresholdId===t.id)));
    }
}