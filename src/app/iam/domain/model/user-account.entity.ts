import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Credentials} from './credentials';
import {PasswordHash} from './password-hash';
import {RoleType} from './role.entity';
import {Username} from './username';

export type AccountStatus = 'ACTIVE' | 'DISABLED';

export interface UserAccountProps {
  id: number;
  employeeId: number;
  username: string;
  passwordHash: string;
  role: RoleType;
  status: AccountStatus;
  mustChangePassword: boolean;
  lastSignInAt: string | null;
}

export class UserAccount implements BaseEntity {
  id: number;
  employeeId: number;
  credentials: Credentials;
  role: RoleType;
  status: AccountStatus;
  mustChangePassword: boolean;
  lastSignInAt: string | null;

  constructor(props: UserAccountProps) {
    this.id = props.id;
    this.employeeId = props.employeeId;
    this.credentials = new Credentials(new Username(props.username), new PasswordHash(props.passwordHash));
    this.role = props.role;
    this.status = props.status;
    this.mustChangePassword = props.mustChangePassword;
    this.lastSignInAt = props.lastSignInAt;
  }

  get username(): string { return this.credentials.username.value; }
  get passwordHash(): string { return this.credentials.passwordHash.value; }

  changePassword(newPasswordHash: PasswordHash): void {
    this.credentials = this.credentials.withPasswordHash(newPasswordHash);
    this.mustChangePassword = false;
  }

  resetPassword(temporaryPasswordHash: PasswordHash): void {
    if (!this.canSignIn()) throw new Error('iam.error.disabled-reset');
    this.credentials = this.credentials.withPasswordHash(temporaryPasswordHash);
    this.mustChangePassword = true;
  }

  changeRole(newRole: RoleType): void {
    this.role = newRole;
  }

  disable(): void { this.status = 'DISABLED'; }
  enable(): void { this.status = 'ACTIVE'; }

  registerSignIn(): void { this.lastSignInAt = new Date().toISOString(); }
  canSignIn(): boolean { return this.status === 'ACTIVE'; }
  isHrStaff(): boolean { return this.role === 'HR_STAFF'; }

  toProps(): UserAccountProps {
    return {
      id: this.id,
      employeeId: this.employeeId,
      username: this.username,
      passwordHash: this.passwordHash,
      role: this.role,
      status: this.status,
      mustChangePassword: this.mustChangePassword,
      lastSignInAt: this.lastSignInAt
    };
  }
}