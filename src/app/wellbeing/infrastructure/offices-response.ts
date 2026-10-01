import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response';
export interface OfficeResource extends BaseResource {
    name:string;
    building:string;
    floor:string;
    locationReference:string;
    active:boolean;
}
export interface OfficesResponse extends BaseResponse {offices:OfficeResource[];}
