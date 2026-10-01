import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {UserAccount} from '../domain/model/user-account.entity';
import {Role} from '../domain/model/role.entity';
import {UserAccountsApiEndpoint} from './user-accounts-api-endpoint';
import {RolesApiEndpoint} from './roles-api-endpoint';

@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  private readonly accountsEndpoint: UserAccountsApiEndpoint;
  private readonly rolesEndpoint: RolesApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.accountsEndpoint = new UserAccountsApiEndpoint(http);
    this.rolesEndpoint = new RolesApiEndpoint(http);
  }

  getAccounts(): Observable<UserAccount[]> { return this.accountsEndpoint.getAll(); }
  updateAccount(account: UserAccount): Observable<UserAccount> { return this.accountsEndpoint.update(account, account.id); }
  getRoles(): Observable<Role[]> { return this.rolesEndpoint.getAll(); }
}
