import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {UserAccount} from '../domain/model/user-account.entity';
import {UserAccountResource, UserAccountsResponse} from './user-accounts-response';

/**
 * Converts user-account API resources to and from the UserAccount domain entity.
 *
 * @remarks Keeps transport data mapping separate from the IAM domain model.
 * @author Dario Avila de la cruz
 */
export class UserAccountAssembler implements BaseAssembler<UserAccount, UserAccountResource, UserAccountsResponse> {
/**
 * Converts an API resource into its corresponding domain entity.
 *
 * @param resource the API resource to convert.
 * @returns The corresponding domain entity.
 * @author Dario Avila de la cruz
 */
  toEntityFromResource(resource: UserAccountResource): UserAccount {
    return new UserAccount(resource);
  }

/**
 * Converts a domain entity into its API resource representation.
 *
 * @param entity the domain entity to convert.
 * @returns The corresponding API resource.
 * @author Dario Avila de la cruz
 */
  toResourceFromEntity(entity: UserAccount): UserAccountResource {
    return entity.toProps();
  }

/**
 * Converts all resources in an API response into domain entities.
 *
 * @param response the API response to convert.
 * @returns The domain entities represented by the response.
 * @author Dario Avila de la cruz
 */
  toEntitiesFromResponse(response: UserAccountsResponse): UserAccount[] {
    return response.data.map(resource => this.toEntityFromResource(resource));
  }
}
