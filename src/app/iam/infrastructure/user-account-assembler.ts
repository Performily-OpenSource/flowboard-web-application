import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {UserAccount} from '../domain/model/user-account.entity';
import {UserAccountResource, UserAccountsResponse} from './user-accounts-response';

export class UserAccountAssembler implements BaseAssembler<UserAccount, UserAccountResource, UserAccountsResponse> {
  toEntityFromResource(resource: UserAccountResource): UserAccount {
    return new UserAccount(resource);
  }

  toResourceFromEntity(entity: UserAccount): UserAccountResource {
    return entity.toProps();
  }

  toEntitiesFromResponse(response: UserAccountsResponse): UserAccount[] {
    return response.data.map(resource => this.toEntityFromResource(resource));
  }
}
