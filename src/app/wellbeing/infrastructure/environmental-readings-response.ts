import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; 
import {MetricType} from '../domain/model/metric-type';

/**
 * Represents an environmental reading received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface ReadingResource extends BaseResource {
    officeId:number;
    deviceId:number;
    metricType:MetricType;
    metricValue:number;
    recordedAt:string;
}
/**
 * API response containing environmental readings.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface EnvironmentalReadingsResponse extends BaseResponse {environmentalReadings:ReadingResource[];}
