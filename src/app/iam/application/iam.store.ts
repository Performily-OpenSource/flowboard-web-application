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

export interface AccountListItem extends UserAccount {
  employeeName: string;
  employeeEmail: string;
}

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

  constructor() {
    this.load();
  }

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

  signOut(): void {
    this.session.clear();
    this.currentEmployee.setEmployeeId(1);
  }

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

  private createToken(account: UserAccount): string {
    return `demo.${btoa(JSON.stringify({sub: account.id, employeeId: account.employeeId, role: account.role, iat: Date.now()}))}.flowboard`;
  }

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


  // The browser fake-API has no server-side BCrypt runtime; the real API should replace this with BCrypt.
  private async hashPassword(password: string): Promise<string> {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return `sha256$${Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (hash.startsWith('sha256$')) return (await this.hashPassword(password)) === hash;
    return false;
  }

  private generateTemporaryPassword(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let result = 'Flow';
    for (let i = 0; i < 8; i++) result += alphabet[Math.floor(Math.random() * alphabet.length)];
    return `${result}1!`;
  }
}
