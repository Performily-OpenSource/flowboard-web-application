import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {EmployeeDocument} from '../domain/model/employee-document.entity';
import {EmployeeDocumentResource, EmployeeDocumentsResponse} from './employee-documents-response';
import {EmployeeDocumentAssembler} from './employee-document-assembler';
import {catchError, map, Observable} from 'rxjs';

export class EmployeeDocumentsApiEndpoint extends BaseApiEndpoint<EmployeeDocument, EmployeeDocumentResource, EmployeeDocumentsResponse, EmployeeDocumentAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderEmployeeDocumentsEndpointPath}`, new EmployeeDocumentAssembler());
  }

  getByEmployeeId(employeeId: number): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocumentResource[]>(`${this.endpointUrl}?employeeId=${employeeId}`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to get employee documents'))
    );
  }
}
