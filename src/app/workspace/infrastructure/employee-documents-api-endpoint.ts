import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {EmployeeDocument} from '../domain/model/employee-document.entity';
import {EmployeeDocumentResource, EmployeeDocumentsResponse} from './employee-documents-response';
import {EmployeeDocumentAssembler} from './employee-document-assembler';
import {catchError, map, Observable} from 'rxjs';

/**
 * API endpoint for the EmployeeDocument resource, targeting the '/employee-documents' REST collection
 * (platformProviderApiBaseUrl + /employee-documents). Inherits CRUD operations from BaseApiEndpoint.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeeDocumentsApiEndpoint extends BaseApiEndpoint<EmployeeDocument, EmployeeDocumentResource, EmployeeDocumentsResponse, EmployeeDocumentAssembler> {

  /**
   * Creates the endpoint with the /employee-documents URL and an EmployeeDocumentAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderEmployeeDocumentsEndpointPath}`, new EmployeeDocumentAssembler());
  }

  /**
   * Retrieves the documents of an employee (GET /employee-documents?employeeId={employeeId}).
   *
   * @param employeeId - The identifier of the employee.
   * @returns An observable with the employee's documents; errors with 'Failed to get employee documents' on failure
   * @author Oscar Lizandro Vasquez Llave
   */
  getByEmployeeId(employeeId: number): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocumentResource[]>(`${this.endpointUrl}?employeeId=${employeeId}`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to get employee documents'))
    );
  }
}
