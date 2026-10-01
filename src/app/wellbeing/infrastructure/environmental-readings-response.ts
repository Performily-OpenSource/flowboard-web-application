import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; 
import {MetricType} from '../domain/model/metric-type';

export interface ReadingResource extends BaseResource {
    officeId:number;
    deviceId:number;
    metricType:MetricType;
    metricValue:number;
    recordedAt:string;
}
export interface EnvironmentalReadingsResponse extends BaseResponse {environmentalReadings:ReadingResource[];}
