import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {RoleType} from '../domain/model/role.entity';

/** Login / change-password response of the Flowboard Web Service. */
export interface LoginResultResource {
  token: string;
  role: RoleType;
  employeeId: number;
  mustChangePassword: boolean;
}

/** Account as exposed by `GET /accounts` (the backend never exposes password hashes). */
export interface AccountResource {
  id: number;
  employeeId: number;
  username: string;
  role: RoleType;
  status: 'ACTIVE' | 'DISABLED';
  mustChangePassword: boolean;
}

/**
 * Talks to the IAM bounded context of the Flowboard Web Service.
 *
 * @remarks Authentication is done by the backend; the Bearer token is attached by `authInterceptor`.
 */
@Injectable({providedIn: 'root'})
export class IamApi {
  private readonly baseUrl = environment.webServiceApiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResultResource> {
    return this.http.post<LoginResultResource>(`${this.baseUrl}/auth/login`, {username, password});
  }

  changePassword(currentPassword: string, newPassword: string): Observable<LoginResultResource> {
    return this.http.post<LoginResultResource>(`${this.baseUrl}/auth/change-password`, {currentPassword, newPassword});
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }

  getAccounts(): Observable<AccountResource[]> {
    return this.http.get<AccountResource[]>(`${this.baseUrl}/accounts`);
  }

  changeRole(accountId: number, role: RoleType): Observable<AccountResource> {
    return this.http.patch<AccountResource>(`${this.baseUrl}/accounts/${accountId}/role`, {role});
  }

  resetPassword(accountId: number): Observable<{temporaryPassword: string}> {
    return this.http.post<{temporaryPassword: string}>(`${this.baseUrl}/accounts/${accountId}/reset-password`, {});
  }
}
