import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {MetricValue} from './metric-value';
import {MetricThreshold} from './metric-threshold.entity';
import {HealthIndicator} from './health-indicator';

export class EnvironmentalReading implements BaseEntity {
    readonly id:number;
    readonly officeId:number;
    readonly deviceId:number;
    readonly measurement:MetricValue;
    readonly recordedAt:string;

    constructor(props:{id:number;officeId:number;deviceId:number;measurement:MetricValue;recordedAt:string}){
        this.id=props.id;
        this.officeId=props.officeId;
        this.deviceId=props.deviceId;
        this.measurement=props.measurement;
        this.recordedAt=props.recordedAt;
    }

    isRecent(validityHours:number):boolean{
        const timestamp=new Date(this.recordedAt).getTime();
        return Number.isFinite(timestamp)&&Date.now()-timestamp<=validityHours*60*60*1000;
    }

    classify(threshold:MetricThreshold):HealthIndicator{
        return threshold.classify(this.measurement);
    }
}