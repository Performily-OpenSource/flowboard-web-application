import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; 
import {MetricType} from '../domain/model/metric-type'; 
import {DeviceStatus} from '../domain/model/device-status';

/**
 * Represents a device received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface DeviceResource extends BaseResource {
    code:string;
    officeId:number|null;
    supportedMetrics:MetricType[];
    status:DeviceStatus;
}

/**
 * API response containing devices.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface DevicesResponse extends BaseResponse {devices:DeviceResource[];}
