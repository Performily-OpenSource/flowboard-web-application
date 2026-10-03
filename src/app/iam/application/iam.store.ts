import {computed, DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin, retry} from 'rxjs';
import {CurrentEmployeeStore} from '../../shared/application/current-employee.store';
import {SessionStore} from '../../shared/application/session.store';
import {IamApi} from '../infrastructure/iam-api';
import {WorkspaceAcl, IamEmployee} from '../infrastructure/workspace-acl';
import {PlainPassword} from '../domain/model/plain-password';
import {RoleType} from '../domain/model/role.entity';
import {PasswordHash} from '../domain/model/password-hash';
import {UserAccount} from '../domain/model/user-account.entity';

/**
 * Represents an IAM account enriched with employee information for account administration.
 *
 * @remarks Defines the account data consumed by the account list and role-management views.
 * @author Dario Avila de la cruz
 */
export interface AccountListItem extends UserAccount {
  employeeName: string;
  employeeEmail: string;
}

/**
 * Coordinates IAM account state, authentication and account-management operations.
 *
 * @remarks Acts as the application-level state store for authentication, password changes, password resets and role changes.
 * @author Dario Avila de la cruz
 */
@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(IamApi);
  private readonly workspace = inject(WorkspaceAcl);
  private readonly currentEmployee = inject(CurrentEmployeeStore);
  private readonly session = inject(SessionStore);

  private readonly accountsSignal = signal<UserAccount[]>([]);
  private readonly employeesSignal = signal<IamEmployee[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly accounts = computed<AccountListItem[]>(() => {
    const employees = new Map(this.employeesSignal().map(employee => [employee.id, employee]));
    return this.accountsSignal().map(account => ({
      ...account,
      employeeName: employees.get(account.employeeId)?.fullName ?? '-',
      employeeEmail: employees.get(account.employeeId)?.email ?? account.username
    })) as AccountListItem[];
  });
  readonly roles = computed(() => [...new Set(this.accountsSignal().map(account => account.role))]);
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly activeHrCount = computed(() => this.accountsSignal().filter(a => a.status === 'ACTIVE' && a.role === 'HR_STAFF').length);

/**
 * Performs the constructor operation.
 */
  constructor() {
    this.load();
  }

/**
 * Loads the required data for the bounded context into the application store.
 */
  load(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({accounts: this.api.getAccounts().pipe(retry(2)), employees: this.workspace.getEmployees().pipe(retry(2))})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({accounts, employees}) => {
          this.accountsSignal.set(accounts);
          this.employeesSignal.set(employees);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.loadingSignal.set(false);
          this.errorSignal.set('iam.error.load');
        }
      });
  }

/**
 * Authenticates an account using the supplied username and password.
 *
 * @param username the account username.
 * @param password the password supplied for authentication.
 * @returns The authentication result: success, invalid credentials, or a disabled account.
 * @author Dario Avila de la cruz
 */
  authenticate(username: string, password: string): Promise<'success' | 'invalid' | 'disabled'> {
    const normalized = username.trim().toLowerCase();
    this.errorSignal.set(null);
    return new Promise(resolve => {
      this.api.getAccounts().pipe(retry(2), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: async accounts => {
          const account = accounts.find(item => item.username === normalized);
          if (!account) { this.errorSignal.set('iam.login.invalid-credentials'); resolve('invalid'); return; }
          if (!account.canSignIn()) { resolve('disabled'); return; }
          const matches = await this.verifyPassword(password, account.passwordHash);
          if (!matches) { this.errorSignal.set('iam.login.invalid-credentials'); resolve('invalid'); return; }

          const employee = this.employeesSignal().find(item => item.id === account.employeeId)
            ?? await this.findEmployee(account.employeeId);
          if (employee?.status === 'TERMINATED') {
            account.disable();
            this.api.updateAccount(account).pipe(retry(2), takeUntilDestroyed(this.destroyRef)).subscribe();
            resolve('disabled');
            return;
          }
          account.registerSignIn();
          this.api.updateAccount(account).pipe(retry(2), takeUntilDestroyed(this.destroyRef)).subscribe({
            next: updated => {
              this.accountsSignal.update(items => items.map(item => item.id === updated.id ? updated : item));
              this.setAuthenticatedSession(updated, employee?.fullName ?? updated.username);
              resolve('success');
            },
            error: () => resolve('success')
          });
        },
        error: () => resolve('invalid')
      });
    });
  }

/**
 * Changes the password of the currently authenticated account.
 *
 * @param temporaryPassword the temporary password issued for the account.
 * @param newPassword the new password to assign.
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  async changeCurrentPassword(temporaryPassword: string, newPassword: string): Promise<boolean> {
    const current = this.session.session();
    if (!current) return false;
    const source = this.accountsSignal().find(item => item.id === current.accountId);
    if (!source) return false;
    const account = new UserAccount(source.toProps());
    if (!(await this.verifyPassword(temporaryPassword, account.passwordHash))) {
      this.errorSignal.set('iam.error.invalid-temporary');
      return false;
    }
    const requirements = PlainPassword.validate(newPassword);
    if (requirements.length) {
      this.errorSignal.set(requirements[0]);
      return false;
    }
    const hash = await this.hashPassword(newPassword);
    account.changePassword(new PasswordHash(hash));
    return new Promise(resolve => this.api.updateAccount(account).pipe(retry(2), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => {
        this.accountsSignal.update(items => items.map(item => item.id === updated.id ? updated : item));
        this.session.updateMustChangePassword(false);
        resolve(true);
      },
      error: () => { this.errorSignal.set('iam.error.change-password'); resolve(false); }
    }));
  }

/**
 * Replaces the account password hash with a temporary hash and marks the account for a password change.
 *
 * @param accountId the account identifier.
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  async resetPassword(accountId: number): Promise<boolean> {
    const source = this.accountsSignal().find(item => item.id === accountId);
    if (!source || !source.canSignIn()) {
      this.errorSignal.set('iam.error.disabled-reset');
      return false;
    }
    const account = new UserAccount(source.toProps());
    const temporaryPassword = this.generateTemporaryPassword();
    const hash = await this.hashPassword(temporaryPassword);
    account.resetPassword(new PasswordHash(hash));
    return new Promise(resolve => this.api.updateAccount(account).pipe(retry(2), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => {
        this.accountsSignal.update(items => items.map(item => item.id === updated.id ? updated : item));
        resolve(true);
      },
      error: () => { this.errorSignal.set('iam.error.reset-password'); resolve(false); }
    }));
  }

/**
 * Assigns a new role to the account.
 *
 * @param accountId the account identifier.
 * @param role the role to assign or select.
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  changeRole(accountId: number, role: RoleType): Promise<boolean> {
    const source = this.accountsSignal().find(item => item.id === accountId);
    if (!source) return Promise.resolve(false);
    const account = new UserAccount(source.toProps());
    if (account.role === 'HR_STAFF' && role === 'EMPLOYEE' && account.status === 'ACTIVE' && this.activeHrCount() <= 1) {
      this.errorSignal.set('iam.error.last-hr');
      return Promise.resolve(false);
    }
    account.changeRole(role);
    return new Promise(resolve => this.api.updateAccount(account).pipe(retry(2), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => { this.accountsSignal.update(items => items.map(item => item.id === updated.id ? updated : item)); resolve(true); },
      error: () => { this.errorSignal.set('iam.error.change-role'); resolve(false); }
    }));
  }

/**
 * Ends the current authenticated session.
 */
  signOut(): void {
    this.session.clear();
    this.currentEmployee.setEmployeeId(1);
  }

/**
 * Performs the setAuthenticatedSession operation.
 *
 * @param account the account being updated or displayed.
 * @param displayName the value used by the operation.
 * @author Dario Avila de la cruz
 */
  private setAuthenticatedSession(account: UserAccount, displayName: string): void {
    this.session.setSession({
      token: this.createToken(account),
      accountId: account.id,
      employeeId: account.employeeId,
      displayName,
      role: account.role,
      mustChangePassword: account.mustChangePassword
    });
    this.currentEmployee.setEmployeeId(account.employeeId);
  }

/**
 * Performs the createToken operation.
 *
 * @param account the account being updated or displayed.
 * @returns The value produced by the `createToken` operation.
 * @author Dario Avila de la cruz
 */
  private createToken(account: UserAccount): string {
    return `demo.${btoa(JSON.stringify({sub: account.id, employeeId: account.employeeId, role: account.role, iat: Date.now()}))}.flowboard`;
  }

/**
 * Performs the findEmployee operation.
 *
 * @param employeeId the employee identifier.
 * @returns The value produced by the `findEmployee` operation.
 * @author Dario Avila de la cruz
 */
  private async findEmployee(employeeId: number): Promise<IamEmployee | undefined> {
    try {
      const employees = await this.workspace.getEmployees().pipe(retry(2)).toPromise();
      const employee = employees?.find(item => item.id === employeeId);
      if (employees) this.employeesSignal.set(employees);
      return employee;
    } catch {
      return undefined;
    }
  }

/**
 * Performs the hashPassword operation.
 *
 * @param password the password supplied for authentication.
 * @returns The value produced by the `hashPassword` operation.
 * @author Dario Avila de la cruz
 */
  private async hashPassword(password: string): Promise<string> {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return `sha256$${Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
  }

/**
 * Performs the verifyPassword operation.
 *
 * @param password the password supplied for authentication.
 * @param hash the value used by the operation.
 * @returns The value produced by the `verifyPassword` operation.
 * @author Dario Avila de la cruz
 */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (hash.startsWith('sha256$')) return (await this.hashPassword(password)) === hash;
    return false;
  }

/**
 * Performs the generateTemporaryPassword operation.
 * 
 * @returns The value produced by the `generateTemporaryPassword` operation.
 * @author Dario Avila de la cruz
 */
  private generateTemporaryPassword(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let result = 'Flow';
    for (let i = 0; i < 8; i++) result += alphabet[Math.floor(Math.random() * alphabet.length)];
    return `${result}1!`;
  }
}
