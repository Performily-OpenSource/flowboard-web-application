import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface AreaResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface AreasResponse extends BaseResponse {
  areas: AreaResource[];
}
