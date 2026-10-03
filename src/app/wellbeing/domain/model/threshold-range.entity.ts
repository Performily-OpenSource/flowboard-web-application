import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {HealthIndicator} from './health-indicator';

/**
 * Properties required to create a threshold range.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface ThresholdRangeProps {
    id: number;
    metricThresholdId: number;
    indicator: HealthIndicator;
    minValue:number;
    maxValue:number;
}

/**
 * Represents a range of values associated with a wellbeing indicator.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class ThresholdRange implements BaseEntity {
    readonly id:number;
    readonly metricThresholdId:number;
    readonly indicator:HealthIndicator;
    readonly minValue:number;
    readonly maxValue:number;

/**
 * Initializes the instance with the data required for operation.
 * @param props Parameter used by the operation.
 * @author Diana Li
 */
    constructor(props:ThresholdRangeProps){
        if(!Number.isFinite(props.minValue)||!Number.isFinite(props.maxValue)||props.maxValue<=props.minValue) throw new Error('A threshold range requires minValue < maxValue.');
        this.id=props.id;
        this.metricThresholdId=props.metricThresholdId;
        this.indicator=props.indicator;
        this.minValue=props.minValue;
        this.maxValue=props.maxValue;
    }

/**
 * Determines whether a value belongs to the range.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
    contains(value:number):boolean{
        return value>=this.minValue&&value<=this.maxValue;
    }

/**
 * Determines whether another range is contiguous with the current range.
 * @param other Parameter used by the operation.
 * @author Diana Li
 */
    isContiguousWith(other:ThresholdRange):boolean{
        return Math.abs(this.maxValue-other.minValue)<.000001||Math.abs(other.maxValue-this.minValue)<.000001;
    }
}