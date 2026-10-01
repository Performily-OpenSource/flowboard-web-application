import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {HealthIndicator} from './health-indicator';

export interface ThresholdRangeProps {
    id: number;
    metricThresholdId: number;
    indicator: HealthIndicator;
    minValue:number;
    maxValue:number;
}

export class ThresholdRange implements BaseEntity {
    readonly id:number;
    readonly metricThresholdId:number;
    readonly indicator:HealthIndicator;
    readonly minValue:number;
    readonly maxValue:number;

    constructor(props:ThresholdRangeProps){
        if(!Number.isFinite(props.minValue)||!Number.isFinite(props.maxValue)||props.maxValue<=props.minValue) throw new Error('A threshold range requires minValue < maxValue.');
        this.id=props.id;
        this.metricThresholdId=props.metricThresholdId;
        this.indicator=props.indicator;
        this.minValue=props.minValue;
        this.maxValue=props.maxValue;
    }

    contains(value:number):boolean{
        return value>=this.minValue&&value<=this.maxValue;
    }

    isContiguousWith(other:ThresholdRange):boolean{
        return Math.abs(this.maxValue-other.minValue)<.000001||Math.abs(other.maxValue-this.minValue)<.000001;
    }
}