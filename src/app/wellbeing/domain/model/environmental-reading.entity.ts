import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {MetricValue} from './metric-value';
import {MetricThreshold} from './metric-threshold.entity';
import {HealthIndicator} from './health-indicator';

/**
 * Represents an environmental reading associated with a workspace and metric.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class EnvironmentalReading implements BaseEntity {
    readonly id:number;
    readonly officeId:number;
    readonly deviceId:number;
    readonly measurement:MetricValue;
    readonly recordedAt:string;

/**
 * Initializes the instance with the data required for operation.
 * @param props Parameter used by the operation.
 * @author Diana Li
 */
    constructor(props:{id:number;officeId:number;deviceId:number;measurement:MetricValue;recordedAt:string}){
        this.id=props.id;
        this.officeId=props.officeId;
        this.deviceId=props.deviceId;
        this.measurement=props.measurement;
        this.recordedAt=props.recordedAt;
    }

/**
 * Determines whether the reading is within the period considered recent.
 * @param validityHours Parameter used by the operation.
 * @author Diana Li
 */
    isRecent(validityHours:number):boolean{
        const timestamp=new Date(this.recordedAt).getTime();
        return Number.isFinite(timestamp)&&Date.now()-timestamp<=validityHours*60*60*1000;
    }

/**
 * Classifies a value according to the configured ranges.
 * @param threshold Parameter used by the operation.
 * @author Diana Li
 */
    classify(threshold:MetricThreshold):HealthIndicator{
        return threshold.classify(this.measurement);
    }
}