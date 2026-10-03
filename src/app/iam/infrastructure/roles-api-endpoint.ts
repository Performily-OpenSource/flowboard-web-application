import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Role} from '../domain/model/role.entity';
import {RoleAssembler} from './role-assembler';
import {RoleResource, RolesResponse} from './roles-response';

/**
 * Provides the HTTP endpoint configuration for IAM roles.
 *
 * @remarks Binds the generic API endpoint infrastructure to Role resources and the configured platform URL.
 * @author Dario Avila de la cruz
 */
export class RolesApiEndpoint extends BaseApiEndpoint<Role, RoleResource, RolesResponse, RoleAssembler> {
/**
 * Performs the constructor operation.
 *
 * @param http the HTTP client dependency.
 * @author Dario Avila de la cruz
 */
  constructor(http: HttpClient) {
    super(http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderRolesEndpointPath}`,
      new RoleAssembler());
  }
}
