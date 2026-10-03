import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; 
import {MetricType} from '../domain/model/metric-type';
/**
 * Represents a metric threshold received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface ThresholdResource extends BaseResource {metricType:MetricType;}
/**
 * API response containing metric thresholds.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface MetricThresholdsResponse extends BaseResponse {metricThresholds:ThresholdResource[];}
