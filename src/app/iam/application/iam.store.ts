import {HttpErrorResponse} from '@angular/common/http';
import {computed, inject, Injectable, signal} from '@angular/core';
import {firstValueFrom, forkJoin} from 'rxjs';
import {CurrentEmployeeStore} from '../../shared/application/current-employee.store';
import {SessionStore} from '../../shared/application/session.store';
import {AccountResource, IamApi, LoginResultResource} from '../infrastructure/iam-api';
import {IamEmployee, WorkspaceAcl} from '../infrastructure/workspace-acl';
import {PlainPassword} from '../domain/model/plain-password';
import {RoleType} from '../domain/model/role.entity';

/**
 * Account enriched with employee information for account administration.
 *
 * @remarks Built from `GET /accounts` (IAM) and the employees of Workspace; the backend never exposes password hashes.
 */
export interface AccountListItem {
  id: number;
  employeeId: number;
  username: string;
  role: RoleType;
  status: 'ACTIVE' | 'DISABLED';
  mustChangePassword: boolean;
  lastSignInAt: string | null;
  employeeName: string;
  employeeEmail: string;
}

/**
 * Coordinates authentication and account administration against the Flowboard Web Service.
 *
 * @remarks Login, password change, role change and password reset are validated by the backend.
 * @author Dario Avila de la cruz
 */
@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly api = inject(IamApi);
  private readonly workspace = inject(WorkspaceAcl);
  private readonly currentEmployee = inject(CurrentEmployeeStore);
  private readonly session = inject(SessionStore);

  private readonly accountsSignal = signal<AccountResource[]>([]);
  private readonly employeesSignal = signal<IamEmployee[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly temporaryPasswordSignal = signal<string | null>(null);

  readonly accounts = computed<AccountListItem[]>(() => {
    const employees = new Map(this.employeesSignal().map(employee => [employee.id, employee]));
    return this.accountsSignal().map(account => ({
      ...account,
      lastSignInAt: null,
      employeeName: employees.get(account.employeeId)?.fullName ?? '-',
      employeeEmail: employees.get(account.employeeId)?.email ?? account.username
    }));
  });
  readonly roles = computed(() => [...new Set(this.accountsSignal().map(account => account.role))]);
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  /** Temporary password returned by the last reset; shown once to the HR user. */
  readonly temporaryPassword = this.temporaryPasswordSignal.asReadonly();
  readonly activeHrCount = computed(() => this.accountsSignal().filter(a => a.status === 'ACTIVE' && a.role === 'HR_STAFF').length);

  /** Loads accounts and employees. Only HR_STAFF can call these endpoints, so it is requested by the account list view. */
  load(): void {
    if (this.session.role() !== 'HR_STAFF') return;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({accounts: this.api.getAccounts(), employees: this.workspace.getEmployees()}).subscribe({
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

  mustChangePassword(): boolean { return this.session.mustChangePassword(); }

  async authenticate(username: string, password: string): Promise<'success' | 'invalid' | 'disabled'> {
    this.errorSignal.set(null);
    try {
      const result = await firstValueFrom(this.api.login(username.trim().toLowerCase(), password));
      await this.startSession(result, username.trim().toLowerCase());
      return 'success';
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 403) return 'disabled';
      this.errorSignal.set('iam.login.invalid-credentials');
      return 'invalid';
    }
  }

  async changeCurrentPassword(temporaryPassword: string, newPassword: string): Promise<boolean> {
    const current = this.session.session();
    if (!current) return false;
    const requirements = PlainPassword.validate(newPassword);
    if (requirements.length) {
      this.errorSignal.set(requirements[0]);
      return false;
    }
    try {
      const result = await firstValueFrom(this.api.changePassword(temporaryPassword, newPassword));
      await this.startSession(result, current.displayName);
      return true;
    } catch (error) {
      const wrongPassword = error instanceof HttpErrorResponse && error.status === 401;
      this.errorSignal.set(wrongPassword ? 'iam.error.invalid-temporary' : 'iam.error.change-password');
      return false;
    }
  }

  async resetPassword(accountId: number): Promise<boolean> {
    const account = this.accountsSignal().find(item => item.id === accountId);
    if (!account || account.status !== 'ACTIVE') {
      this.errorSignal.set('iam.error.disabled-reset');
      return false;
    }
    try {
      const result = await firstValueFrom(this.api.resetPassword(accountId));
      this.temporaryPasswordSignal.set(result.temporaryPassword);
      this.accountsSignal.update(items => items.map(item => item.id === accountId ? {...item, mustChangePassword: true} : item));
      return true;
    } catch {
      this.errorSignal.set('iam.error.reset-password');
      return false;
    }
  }

  clearTemporaryPassword(): void { this.temporaryPasswordSignal.set(null); }

  async changeRole(accountId: number, role: RoleType): Promise<boolean> {
    const account = this.accountsSignal().find(item => item.id === accountId);
    if (!account) return false;
    if (account.role === 'HR_STAFF' && role === 'EMPLOYEE' && account.status === 'ACTIVE' && this.activeHrCount() <= 1) {
      this.errorSignal.set('iam.error.last-hr');
      return false;
    }
    try {
      const updated = await firstValueFrom(this.api.changeRole(accountId, role));
      this.accountsSignal.update(items => items.map(item => item.id === updated.id ? updated : item));
      return true;
    } catch {
      this.errorSignal.set('iam.error.change-role');
      return false;
    }
  }

  signOut(): void {
    // Revoke the token in the backend (best effort) before dropping it locally.
    if (this.session.isAuthenticated()) this.api.logout().subscribe({error: () => undefined});
    this.session.clear();
    this.accountsSignal.set([]);
    this.employeesSignal.set([]);
    this.currentEmployee.setEmployeeId(1);
  }

  /** Stores the backend token and resolves the display name from the real Workspace employee. */
  private async startSession(result: LoginResultResource, fallbackName: string): Promise<void> {
    this.session.setSession({
      token: result.token,
      accountId: this.accountIdFrom(result.token),
      employeeId: result.employeeId,
      displayName: fallbackName,
      role: result.role,
      mustChangePassword: result.mustChangePassword
    });
    this.currentEmployee.setEmployeeId(result.employeeId);
    // The backend answers 403 on everything but change-password/logout while the password must be changed.
    if (result.mustChangePassword) return;
    try {
      const employee = await firstValueFrom(this.workspace.getEmployee(result.employeeId));
      const current = this.session.session();
      if (current) this.session.setSession({...current, displayName: employee.fullName});
    } catch {
      // Keep the username as display name.
    }
  }

  /** The backend puts the account id in the `sub` claim of the JWT. */
  private accountIdFrom(token: string): number {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return Number(JSON.parse(atob(payload)).sub);
    } catch {
      return 0;
    }
  }
}
