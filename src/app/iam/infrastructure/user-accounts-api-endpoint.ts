import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {UserAccount} from '../domain/model/user-account.entity';
import {UserAccountAssembler} from './user-account-assembler';
import {UserAccountResource, UserAccountsResponse} from './user-accounts-response';

export class UserAccountsApiEndpoint extends BaseApiEndpoint<UserAccount, UserAccountResource, UserAccountsResponse, UserAccountAssembler> {
  constructor(http: HttpClient) {
    super(http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderUserAccountsEndpointPath}`,
      new UserAccountAssembler());
  }
}
