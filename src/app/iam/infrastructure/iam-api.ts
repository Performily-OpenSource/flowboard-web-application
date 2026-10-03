import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {UserAccount} from '../domain/model/user-account.entity';
import {Role} from '../domain/model/role.entity';
import {UserAccountsApiEndpoint} from './user-accounts-api-endpoint';
import {RolesApiEndpoint} from './roles-api-endpoint';

/**
 * Provides the infrastructure API used to access IAM resources.
 *
 * @remarks Delegates account and role operations to the corresponding API endpoints.
 * @author Dario Avila de la cruz
 */
@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  private readonly accountsEndpoint: UserAccountsApiEndpoint;
  private readonly rolesEndpoint: RolesApiEndpoint;

/**
 * Performs the constructor operation.
 *
 * @param http the HTTP client dependency.
 * @author Dario Avila de la cruz
 */
  constructor(http: HttpClient) {
    super();
    this.accountsEndpoint = new UserAccountsApiEndpoint(http);
    this.rolesEndpoint = new RolesApiEndpoint(http);
  }

/**
 * Retrieves all user accounts.
 *
 * @returns An observable that emits the available user accounts.
 * @author Dario Avila de la cruz
 */
  getAccounts(): Observable<UserAccount[]> { return this.accountsEndpoint.getAll(); }
/**
 * Updates a user account through the IAM API.
 *
 * @param account the account being updated or displayed.
 * @returns The value produced by the `updateAccount` operation.
 * @author Dario Avila de la cruz
 */
  updateAccount(account: UserAccount): Observable<UserAccount> { return this.accountsEndpoint.update(account, account.id); }
/**
 * Retrieves the roles available through the IAM API.
 *
 * @returns An observable that emits the available roles.
 * @author Dario Avila de la cruz
 */
  getRoles(): Observable<Role[]> { return this.rolesEndpoint.getAll(); }
}
