import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Office} from '../domain/model/office.entity';
import {OfficeResource, OfficesResponse} from './offices-response';
import {OfficeAssembler} from './office-assembler';

/**
 * Encapsulates HTTP endpoints related to workspaces.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class OfficesApiEndpoint extends BaseApiEndpoint<Office, OfficeResource, OfficesResponse, OfficeAssembler> {
/**
 * Initializes the instance with the data required for operation.
 * @param http Parameter used by the operation.
 * @author Diana Li
 */
  constructor(http: HttpClient) { 
/**
 * Executes the super operation of the component.
 * @param http Parameter used by the operation.
 * @param new Parameter used by the operation.
 * @author Diana Li
 */
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderOfficesEndpointPath}`, new OfficeAssembler()); 
  }
/**
 * Executes the createResource operation of the component.
 * @param resource Parameter used by the operation.
 * @author Diana Li
 */
  createResource(resource: Omit<OfficeResource, 'id'>): Observable<Office> {
    return this.http.post<OfficeResource>(this.endpointUrl, resource).pipe(map(created => this.assembler.toEntityFromResource(created)));
  }
}
