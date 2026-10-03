import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';
import {RoleType} from '../domain/model/role.entity';

/**
 * Represents RoleResource within the Iam bounded context.
 *
 * @remarks Provides the type or behavior required by this part of the bounded context.
 * @author Dario Avila de la cruz
 */
export interface RoleResource extends BaseResource {
  id: number;
  name: RoleType;
}

/**
 * Represents RolesResponse within the Iam bounded context.
 *
 * @remarks Provides the type or behavior required by this part of the bounded context.
 * @author Dario Avila de la cruz
 */
export interface RolesResponse extends BaseResponse {
  data: RoleResource[];
}
