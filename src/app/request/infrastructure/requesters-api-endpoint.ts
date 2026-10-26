import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Requester} from '../domain/model/requester.entity';
import {RequesterAssembler} from './requester-assembler';
import {WorkspaceEmployeeResource} from './workspace-employees-response';

/**
 * Read-only HTTP endpoint of the employees of Workspace in the Flowboard Web Service
 *
 * @remarks It does not extend BaseApiEndpoint because Request never creates, updates or deletes
 * employees; it only reads them to show who submits and who resolves each request.
 * @author Diego Alonso Diaz Villalba
 */
export class RequestersApiEndpoint {
  private readonly endpointUrl = `${environment.webServiceApiBaseUrl}${environment.platformProviderEmployeesEndpointPath}`;
  private readonly assembler = new RequesterAssembler();

  /**
   * Creates the endpoint.
   *
   * @param http - The Angular HTTP client.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(private http: HttpClient) {}

  /**
   * Gets every employee (active, suspended and terminated) as a Requester.
   *
   * @remarks Terminated employees are included so their old requests still show their name.
   * @returns An observable with the requesters
   * @author Diego Alonso Diaz Villalba
   */
  getAll(): Observable<Requester[]> {
    return this.http.get<WorkspaceEmployeeResource[]>(this.endpointUrl).pipe(
      map(resources => this.assembler.toEntitiesFromResources(resources)),
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(`Failed to get employees: ${error.statusText || 'Unexpected error'}`)))
    );
  }
}
