import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Credentials} from './credentials';
import {PasswordHash} from './password-hash';
import {RoleType} from './role.entity';
import {Username} from './username';

/**
 * Defines the lifecycle states supported by an IAM account.
 *
 * @remarks Restricts account status to active and disabled states.
 * @author Dario Avila de la cruz
 */
export type AccountStatus = 'ACTIVE' | 'DISABLED';

/**
 * Defines the properties required to construct a user account.
 *
 * @remarks Provides the data contract used by the UserAccount domain entity.
 * @author Dario Avila de la cruz
 */
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

/**
 * Represents an employee account managed by the IAM bounded context.
 *
 * @remarks Encapsulates account credentials, role, status and sign-in information together with the domain operations that change them.
 * @author Dario Avila de la cruz
 */
export class UserAccount implements BaseEntity {
  id: number;
  employeeId: number;
  credentials: Credentials;
  role: RoleType;
  status: AccountStatus;
  mustChangePassword: boolean;
  lastSignInAt: string | null;

/**
 * Performs the constructor operation.
 *
 * @param props the properties used to initialize the entity.
 * @author Dario Avila de la cruz
 */
  constructor(props: UserAccountProps) {
    this.id = props.id;
    this.employeeId = props.employeeId;
    this.credentials = new Credentials(new Username(props.username), new PasswordHash(props.passwordHash));
    this.role = props.role;
    this.status = props.status;
    this.mustChangePassword = props.mustChangePassword;
    this.lastSignInAt = props.lastSignInAt;
  }

/**
 * Performs the username operation.
 *
 * @returns The value produced by the `username` operation.
 * @author Dario Avila de la cruz
 */
  get username(): string { return this.credentials.username.value; }
/**
 * Performs the passwordHash operation.
 *
 * @returns The value produced by the `passwordHash` operation.
 * @author Dario Avila de la cruz
 */
  get passwordHash(): string { return this.credentials.passwordHash.value; }

/**
 * Replaces the account password hash with a new hash.
 *
 * @param newPasswordHash the value used by the operation.
 * @author Dario Avila de la cruz
 */
  changePassword(newPasswordHash: PasswordHash): void {
    this.credentials = this.credentials.withPasswordHash(newPasswordHash);
    this.mustChangePassword = false;
  }

/**
 * Replaces the account password hash with a temporary hash and marks the account for a password change.
 *
 * @param temporaryPasswordHash the value used by the operation.
 * @author Dario Avila de la cruz
 */
  resetPassword(temporaryPasswordHash: PasswordHash): void {
    if (!this.canSignIn()) throw new Error('iam.error.disabled-reset');
    this.credentials = this.credentials.withPasswordHash(temporaryPasswordHash);
    this.mustChangePassword = true;
  }

/**
 * Assigns a new role to the account.
 *
 * @param newRole the role to assign to the account.
 * @author Dario Avila de la cruz
 */
  changeRole(newRole: RoleType): void {
    this.role = newRole;
  }

/**
 * Marks the account as disabled.
 *
 * @author Dario Avila de la cruz
 */
  disable(): void { this.status = 'DISABLED'; }
/**
 * Marks the account as active.
 *
 * @author Dario Avila de la cruz
 */
  enable(): void { this.status = 'ACTIVE'; }

/**
 * Registers the current time as the account last sign-in time.
 *
 * @author Dario Avila de la cruz
 */
  registerSignIn(): void { this.lastSignInAt = new Date().toISOString(); }
/**
 * Determines whether the account is allowed to sign in.
 *
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  canSignIn(): boolean { return this.status === 'ACTIVE'; }
/**
 * Determines whether the account has the Human Resources role.
 *
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  isHrStaff(): boolean { return this.role === 'HR_STAFF'; }

/**
 * Returns the account data as domain properties.
 *
 * @returns The account properties representing the entity.
 * @author Dario Avila de la cruz
 */
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
