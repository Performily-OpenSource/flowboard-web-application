import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Role} from '../domain/model/role.entity';
import {RoleResource, RolesResponse} from './roles-response';

export class RoleAssembler extends BaseAssembler<Role, RoleResource, RolesResponse> {
  toEntityFromResource(resource: RoleResource): Role {
    return new Role(resource);
  }

  toResourceFromEntity(entity: Role): RoleResource {
    return { id: entity.id, name: entity.name };
  }

  toEntitiesFromResponse(response: RolesResponse): Role[] {
    return response.data.map(resource => this.toEntityFromResource(resource));
  }
}
