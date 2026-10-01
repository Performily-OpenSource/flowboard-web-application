import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';
import {AccountStatus} from '../domain/model/user-account.entity';
import {RoleType} from '../domain/model/role.entity';

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

export interface UserAccountsResponse extends BaseResponse {
  data: UserAccountResource[];
}
