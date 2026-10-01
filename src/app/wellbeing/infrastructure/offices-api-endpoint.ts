import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Office} from '../domain/model/office.entity';
import {OfficeResource, OfficesResponse} from './offices-response';
import {OfficeAssembler} from './office-assembler';

export class OfficesApiEndpoint extends BaseApiEndpoint<Office, OfficeResource, OfficesResponse, OfficeAssembler> {
  constructor(http: HttpClient) { 
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderOfficesEndpointPath}`, new OfficeAssembler()); 
  }
  createResource(resource: Omit<OfficeResource, 'id'>): Observable<Office> {
    return this.http.post<OfficeResource>(this.endpointUrl, resource).pipe(map(created => this.assembler.toEntityFromResource(created)));
  }
}
