import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response'; 
import {MetricType} from '../domain/model/metric-type'; 
import {DeviceStatus} from '../domain/model/device-status';

export interface DeviceResource extends BaseResource {
    code:string;
    officeId:number|null;
    supportedMetrics:MetricType[];
    status:DeviceStatus;
}

export interface DevicesResponse extends BaseResponse {devices:DeviceResource[];}
