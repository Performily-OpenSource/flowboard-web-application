import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; import {MetricType} from '../domain/model/metric-type';
export interface ThresholdResource extends BaseResource {metricType:MetricType;}
export interface MetricThresholdsResponse extends BaseResponse {metricThresholds:ThresholdResource[];}
