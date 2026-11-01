import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStore } from '../../shared/application/session.store';
import { CurrentEmployeeStore } from '../../shared/application/current-employee.store';
import { IamApi, AccountResponse, LoginResponse } from '../infrastructure/iam-api';
import { WorkspaceAcl, IamEmployee } from '../infrastructure/workspace-acl';
import { RoleType } from '../domain/model/role.entity';
import { PlainPassword } from '../domain/model/plain-password';

export interface AccountListItem extends AccountResponse {
    employeeName: string;
    employeeEmail: string;
}

@Injectable({ providedIn: 'root' })
export class IamStore {

    private readonly api = inject(IamApi);
    private readonly session = inject(SessionStore);
    private readonly workspace = inject(WorkspaceAcl);
    private readonly currentEmployee = inject(CurrentEmployeeStore);

    private readonly accountsSignal = signal<AccountResponse[]>([]);
    private readonly employeesSignal = signal<IamEmployee[]>([]);
    private readonly loadingSignal = signal(false);
    private readonly errorSignal = signal<string | null>(null);

    readonly loading = this.loadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    readonly accounts = computed<AccountListItem[]>(() => {
        const employees = new Map(this.employeesSignal().map(e => [e.id, e]));
        return this.accountsSignal().map(a => ({
            ...a,
            employeeName: employees.get(a.employeeId)?.fullName ?? '-',
            employeeEmail: employees.get(a.employeeId)?.email ?? a.username
        }));
    });

    readonly roles = computed<RoleType[]>(() => ['HR_STAFF', 'EMPLOYEE']);
    
    readonly activeHrCount = computed(() => 
        this.accountsSignal().filter(a => a.role === 'HR_STAFF' && a.status === 'ACTIVE').length
    );

    constructor() {
        if (this.session.role() === 'HR_STAFF') {
            this.load();
        }
    }

    async load(): Promise<void> {
        if (this.session.role() !== 'HR_STAFF') return;
        this.loadingSignal.set(true);
        this.errorSignal.set(null);
        try {
            const accounts = await firstValueFrom(this.api.getAccounts());
            this.accountsSignal.set(accounts);
            try {
                this.employeesSignal.set(await firstValueFrom(this.workspace.getEmployees()));
            } catch {
                this.employeesSignal.set([]);
            }
        } catch {
            this.errorSignal.set('iam.error.load');
        } finally {
            this.loadingSignal.set(false);
        }
    }

    private startSession(r: LoginResponse, username: string): void {
        const old = this.session.session();
        this.session.setSession({
            token: r.token,
            accountId: old?.accountId ?? 0,
            employeeId: r.employeeId,
            role: r.role,
            mustChangePassword: r.mustChangePassword,
            displayName: username
        });
        this.currentEmployee.setEmployeeId(r.employeeId);
    }

    async authenticate(username: string, password: string): Promise<'success' | 'invalid' | 'disabled'> {
        this.errorSignal.set(null);
        try {
            const result = await firstValueFrom(this.api.login(username.trim(), password));
            this.startSession(result, username.trim());
            if (result.role === 'HR_STAFF' && !result.mustChangePassword) {
                void this.load();
            }
            return 'success';
        } catch (e) {
            if (e instanceof HttpErrorResponse && e.status === 403) return 'disabled';
            this.errorSignal.set('iam.login.invalid-credentials');
            return 'invalid';
        }
    }

    async changeCurrentPassword(currentPassword: string, newPassword: string): Promise<boolean> {
        this.errorSignal.set(null);
        const problems = PlainPassword.validate(newPassword);
        if (problems.length) {
            this.errorSignal.set(problems[0]);
            return false;
        }
        try {
            const result = await firstValueFrom(this.api.changePassword(currentPassword, newPassword));
            this.startSession(result, this.session.displayName());
            if (result.role === 'HR_STAFF') {
                void this.load();
            }
            return true;
        } catch {
            this.errorSignal.set('iam.error.change-password');
            return false;
        }
    }

    readonly temporaryPassword = signal<string | null>(null);

    async resetPassword(id: number): Promise<boolean> {
        this.errorSignal.set(null);
        this.temporaryPassword.set(null);
        try {
            const r = await firstValueFrom(this.api.resetPassword(id));
            this.temporaryPassword.set(r.temporaryPassword);
            await this.load();
            return true;
        } catch {
            this.errorSignal.set('iam.error.reset-password');
            return false;
        }
    }

    async changeRole(id: number, role: RoleType): Promise<boolean> {
        this.errorSignal.set(null);
        try {
            const updated = await firstValueFrom(this.api.changeRole(id, role));
            this.accountsSignal.update(items => items.map(a => a.id === id ? updated : a));
            return true;
        } catch {
            this.errorSignal.set('iam.error.change-role');
            return false;
        }
    }

    signOut(): void {
        if (this.session.session()?.token) {
            void firstValueFrom(this.api.logout()).catch(() => {});
        }
        this.session.clear();
        this.accountsSignal.set([]);
    }
}