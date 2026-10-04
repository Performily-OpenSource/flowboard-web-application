import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of an area returned by the API. */
export interface AreaResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

/** Response wrapper returned by the API when the areas are listed inside an 'areas' property. */
export interface AreasResponse extends BaseResponse {
  areas: AreaResource[];
}
