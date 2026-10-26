import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {RequestType} from '../domain/model/request-type.entity';
import {RequestTypeResource, RequestTypesResponse} from './request-types-response';
import {RequestTypeAssembler} from './request-type-assembler';
import {handleWebServiceError} from './web-service-error';

/**
 * HTTP endpoint of the request types resource
 *
 * @remarks Create and update use the inherited POST and PUT; the update also replaces the fields of
 * the form. Activating and deactivating have their own PATCH endpoints.
 * @author Diego Alonso Diaz Villalba
 */
export class RequestTypesApiEndpoint extends BaseApiEndpoint<RequestType, RequestTypeResource, RequestTypesResponse, RequestTypeAssembler> {

  /**
   * Creates the endpoint with its URL and assembler.
   *
   * @param http - The Angular HTTP client.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(http: HttpClient) {
    super(http, `${environment.webServiceApiBaseUrl}${environment.platformProviderRequestTypesEndpointPath}`, new RequestTypeAssembler());
  }

  /**
   * Keeps the reason sent by the web service in the error message.
   *
   * @param operation - Description of the operation.
   * @returns The error handler
   * @author Diego Alonso Diaz Villalba
   */
  protected override handleError(operation: string) {
    return handleWebServiceError(operation);
  }

  /**
   * Activates a request type (PATCH /request-types/{id}/activate).
   *
   * @param id - The request type identifier.
   * @returns An observable with the updated request type
   * @author Diego Alonso Diaz Villalba
   */
  activate(id: number): Observable<RequestType> {
    return this.patchStatus(id, 'activate', 'Failed to activate request type');
  }

  /**
   * Deactivates a request type (PATCH /request-types/{id}/deactivate). It keeps its requests.
   *
   * @param id - The request type identifier.
   * @returns An observable with the updated request type
   * @author Diego Alonso Diaz Villalba
   */
  deactivate(id: number): Observable<RequestType> {
    return this.patchStatus(id, 'deactivate', 'Failed to deactivate request type');
  }

  /**
   * Sends a status change of a request type and converts the answer to an entity.
   *
   * @param id - The request type identifier.
   * @param action - The last segment of the URL: 'activate' or 'deactivate'.
   * @param operation - Description used in the error message.
   * @returns An observable with the updated request type
   * @author Diego Alonso Diaz Villalba
   */
  private patchStatus(id: number, action: string, operation: string): Observable<RequestType> {
    return this.http.patch<RequestTypeResource>(`${this.endpointUrl}/${id}/${action}`, {}).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(operation))
    );
  }
}
