import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Role} from '../domain/model/role.entity';
import {RoleResource, RolesResponse} from './roles-response';

/**
 * Converts role API resources to and from the Role domain entity.
 *
 * @remarks Keeps the infrastructure representation of roles separate from the domain model.
 * @author Dario Avila de la cruz
 */
export class RoleAssembler implements BaseAssembler<Role, RoleResource, RolesResponse> {
/**
 * Converts an API resource into its corresponding domain entity.
 *
 * @param resource the API resource to convert.
 * @returns The corresponding domain entity.
 * @author Dario Avila de la cruz
 */
  toEntityFromResource(resource: RoleResource): Role {
    return new Role(resource);
  }

/**
 * Converts a domain entity into its API resource representation.
 *
 * @param entity the domain entity to convert.
 * @returns The corresponding API resource.
 * @author Dario Avila de la cruz
 */
  toResourceFromEntity(entity: Role): RoleResource {
    return { id: entity.id, name: entity.name };
  }

/**
 * Converts all resources in an API response into domain entities.
 *
 * @param response the API response to convert.
 * @returns The domain entities represented by the response.
 * @author Dario Avila de la cruz
 */
  toEntitiesFromResponse(response: RolesResponse): Role[] {
    return response.data.map(resource => this.toEntityFromResource(resource));
  }
}
