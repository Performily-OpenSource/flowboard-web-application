import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';
import {RoleType} from '../domain/model/role.entity';

export interface RoleResource extends BaseResource {
  id: number;
  name: RoleType;
}

export interface RolesResponse extends BaseResponse {
  data: RoleResource[];
}
