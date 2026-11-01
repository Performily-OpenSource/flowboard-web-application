import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface LoginResponse {
    token: string;
    role: 'HR_STAFF' | 'EMPLOYEE';
    employeeId: number;
    mustChangePassword: boolean;
}

export interface AccountResponse {
    id: number;
    employeeId: number;
    username: string;
    role: 'HR_STAFF' | 'EMPLOYEE';
    status: 'ACTIVE' | 'DISABLED';
    mustChangePassword: boolean;
}

@Injectable({ providedIn: 'root' })
export class IamApi {

    private readonly http = inject(HttpClient);
    private readonly base = environment.webServiceApiBaseUrl;

    login(username: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.base}/auth/login`, { username, password });
    }

    changePassword(currentPassword: string, newPassword: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.base}/auth/change-password`, { currentPassword, newPassword });
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.base}/auth/logout`, {});
    }

    getAccounts(): Observable<AccountResponse[]> {
        return this.http.get<AccountResponse[]>(`${this.base}/accounts`);
    }

    changeRole(id: number, role: string): Observable<AccountResponse> {
        return this.http.patch<AccountResponse>(`${this.base}/accounts/${id}/role`, { role });
    }

    resetPassword(id: number): Observable<{ temporaryPassword: string }> {
        return this.http.post<{ temporaryPassword: string }>(`${this.base}/accounts/${id}/reset-password`, {});
    }
}