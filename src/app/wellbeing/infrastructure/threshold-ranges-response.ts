import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; import {HealthIndicator} from '../domain/model/health-indicator';
export interface ThresholdRangeResource extends BaseResource {metricThresholdId:number;healthIndicator:HealthIndicator;minValue:number;maxValue:number;}
export interface ThresholdRangesResponse extends BaseResponse {thresholdRanges:ThresholdRangeResource[];}
