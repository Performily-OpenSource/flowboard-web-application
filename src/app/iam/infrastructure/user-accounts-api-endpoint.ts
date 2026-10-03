import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {UserAccount} from '../domain/model/user-account.entity';
import {UserAccountAssembler} from './user-account-assembler';
import {UserAccountResource, UserAccountsResponse} from './user-accounts-response';

/**
 * Provides the HTTP endpoint configuration for IAM user accounts.
 *
 * @remarks Binds the generic API endpoint infrastructure to UserAccount resources and the configured platform URL.
 * @author Dario Avila de la cruz
 */
export class UserAccountsApiEndpoint extends BaseApiEndpoint<UserAccount, UserAccountResource, UserAccountsResponse, UserAccountAssembler> {
/**
 * Performs the constructor operation.
 *
 * @param http the HTTP client dependency.
 * @author Dario Avila de la cruz
 */
  constructor(http: HttpClient) {
    super(http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderUserAccountsEndpointPath}`,
      new UserAccountAssembler());
  }
}
