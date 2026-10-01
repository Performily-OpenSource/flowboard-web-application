import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {DeviceCode} from './device-code';
import {MetricType} from './metric-type';
import {DeviceStatus} from './device-status';

export class Device implements BaseEntity {
    readonly id:number;
    readonly code:DeviceCode;
    readonly supportedMetrics:Set<MetricType>;
    status:DeviceStatus;
    officeId:number|null;

    constructor(
      props:{
    
        id:number;
        code:DeviceCode;
        supportedMetrics:Set<MetricType>;
        status:DeviceStatus;
        officeId?:number|null}){
        if(props.supportedMetrics.size===0)throw new Error('A device must support at least one metric.');
        this.id=props.id;
        this.code=props.code;
        this.supportedMetrics=new Set(props.supportedMetrics);
        this.status=props.status;
        this.officeId=props.officeId??null;
    }

    canSendReadings():boolean{
        return this.status==='LINKED'&&this.officeId!==null;
    }

    supports(metricType:MetricType):boolean{
        return this.supportedMetrics.has(metricType);
    }
}