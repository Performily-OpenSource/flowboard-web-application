import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';
import {AccountStatus} from '../domain/model/user-account.entity';
import {RoleType} from '../domain/model/role.entity';

/**
 * Represents UserAccountResource within the Iam bounded context.
 *
 * @remarks Provides the type or behavior required by this part of the bounded context.
 * @author Dario Avila de la cruz
 */
export interface UserAccountResource extends BaseResource {
  id: number;
  employeeId: number;
  username: string;
  passwordHash: string;
  role: RoleType;
  status: AccountStatus;
  mustChangePassword: boolean;
  lastSignInAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents UserAccountsResponse within the Iam bounded context.
 *
 * @remarks Provides the type or behavior required by this part of the bounded context.
 * @author Dario Avila de la cruz
 */
export interface UserAccountsResponse extends BaseResponse {
  data: UserAccountResource[];
}
