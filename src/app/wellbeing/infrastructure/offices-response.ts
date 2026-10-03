import {BaseResource,BaseResponse} from '../../shared/infrastructure/base-response';
/**
 * Represents an office received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface OfficeResource extends BaseResource {
    name:string;
    building:string;
    floor:string;
    locationReference:string;
    active:boolean;
}
/**
 * API response containing offices.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface OfficesResponse extends BaseResponse {offices:OfficeResource[];}
