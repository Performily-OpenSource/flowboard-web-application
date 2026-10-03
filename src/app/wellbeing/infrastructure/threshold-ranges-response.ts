import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; 
import {HealthIndicator} from '../domain/model/health-indicator';
/**
 * Represents a threshold range received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface ThresholdRangeResource extends BaseResource {
    metricThresholdId:number;
    healthIndicator:HealthIndicator;
    minValue:number;
    maxValue:number;
}
/**
 * API response containing threshold ranges.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface ThresholdRangesResponse extends BaseResponse {thresholdRanges:ThresholdRangeResource[];}
