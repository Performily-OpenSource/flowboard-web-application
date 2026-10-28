import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {EmployeeDocument} from '../domain/model/employee-document.entity';
import {EmployeeDocumentResource, EmployeeDocumentsResponse} from './employee-documents-response';
import {EmployeeDocumentAssembler} from './employee-document-assembler';
import {WorkspaceApiEndpoint, workspaceApiUrl} from './workspace-api-endpoint';

/**
 * API endpoint for the documents of an employee, targeting
 * GET/POST /api/v1/employees/{employeeId}/documents of the flowboard-web-service.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeeDocumentsApiEndpoint extends WorkspaceApiEndpoint<EmployeeDocument, EmployeeDocumentResource, EmployeeDocumentsResponse, EmployeeDocumentAssembler> {

  /**
   * Creates the endpoint with the /employees URL and an EmployeeDocumentAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, workspaceApiUrl('/employees'), new EmployeeDocumentAssembler());
  }

  /**
   * Retrieves the documents of an employee.
   *
   * @param employeeId - The identifier of the employee.
   * @returns An observable with the documents
   * @author Oscar Lizandro Vasquez Llave
   */
  getByEmployeeId(employeeId: number): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocumentResource[]>(`${this.endpointUrl}/${employeeId}/documents`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource, employeeId))),
      catchError(this.handleError('Failed to get employee documents'))
    );
  }

  /**
   * Attaches a document to the employee given by document.employeeId.
   *
   * @param document - The document to attach.
   * @returns An observable with the attached document
   * @author Oscar Lizandro Vasquez Llave
   */
  override create(document: EmployeeDocument): Observable<EmployeeDocument> {
    return this.http.post<EmployeeDocumentResource>(
      `${this.endpointUrl}/${document.employeeId}/documents`,
      this.assembler.toAttachRequestFromEntity(document)
    ).pipe(
      map(created => this.assembler.toEntityFromResource(created, document.employeeId)),
      catchError(this.handleError('Failed to upload document'))
    );
  }

  /**
   * The API has no operation to delete a document, so this always fails.
   *
   * @param id - The identifier of the document.
   * @returns An observable that errors
   * @author Oscar Lizandro Vasquez Llave
   */
  override delete(id: number): Observable<void> {
    return throwError(() => new Error(`Failed to delete document ${id}: the Workspace API does not allow deleting employee documents`));
  }
}
