import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of an area returned by the API (AreaResponse). */
export interface AreaResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  active: boolean;
  /** Number of ACTIVE employees of the area, calculated by the API. */
  activeEmployees?: number;
}

/** Payload of POST /areas (CreateAreaRequest). */
export interface CreateAreaRequest {
  name: string;
  description: string;
}

/** Payload of PUT /areas/{id} (RenameAreaRequest). */
export interface RenameAreaRequest {
  name: string;
}

/** Response wrapper kept for the BaseAssembler contract; the API returns a plain array. */
export interface AreasResponse extends BaseResponse {
  areas: AreaResource[];
}
