import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Request} from '../domain/model/request.entity';
import {RequestResource, RequestsResponse} from './requests-response';
import {RequestAssembler} from './request-assembler';
import {ResolveRequestResource, ResubmitRequestResource, SubmitRequestResource} from './request-command-resources';
import {handleWebServiceError} from './web-service-error';

/**
 * HTTP endpoint of the requests resource
 *
 * @remarks Besides reading the requests, it exposes one method per action of the request flow.
 * The web service changes the status and adds the history entry, so the client only sends who
 * performs the action and the comment.
 * @author Diego Alonso Diaz Villalba
 */
export class RequestsApiEndpoint extends BaseApiEndpoint<Request, RequestResource, RequestsResponse, RequestAssembler> {

  /**
   * Creates the endpoint with its URL and assembler.
   *
   * @param http - The Angular HTTP client.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(http: HttpClient) {
    super(http, `${environment.webServiceApiBaseUrl}${environment.platformProviderRequestsEndpointPath}`, new RequestAssembler());
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
   * Submits a new request (POST /requests).
   *
   * @param resource - The data of the request.
   * @returns An observable with the created request, routed and with its first history entry
   * @author Diego Alonso Diaz Villalba
   */
  submit(resource: SubmitRequestResource): Observable<Request> {
    return this.http.post<RequestResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to submit request'))
    );
  }

  /**
   * Approves a request (POST /requests/{id}/approve).
   *
   * @param id - The request identifier.
   * @param resource - The approver and an optional comment.
   * @returns An observable with the updated request
   * @author Diego Alonso Diaz Villalba
   */
  approve(id: number, resource: ResolveRequestResource): Observable<Request> {
    return this.runAction(id, 'approve', resource, 'Failed to approve request');
  }

  /**
   * Rejects a request (POST /requests/{id}/reject). The comment is the reason and is required.
   *
   * @param id - The request identifier.
   * @param resource - The approver and the reason.
   * @returns An observable with the updated request
   * @author Diego Alonso Diaz Villalba
   */
  reject(id: number, resource: ResolveRequestResource): Observable<Request> {
    return this.runAction(id, 'reject', resource, 'Failed to reject request');
  }

  /**
   * Returns a request to the requester (POST /requests/{id}/return-for-review). The comment is required.
   *
   * @param id - The request identifier.
   * @param resource - The approver and what must be completed.
   * @returns An observable with the updated request
   * @author Diego Alonso Diaz Villalba
   */
  returnForReview(id: number, resource: ResolveRequestResource): Observable<Request> {
    return this.runAction(id, 'return-for-review', resource, 'Failed to return request for review');
  }

  /**
   * Sends again a request returned for review (POST /requests/{id}/resubmit).
   *
   * @param id - The request identifier.
   * @param resource - The corrected period, values and attachments.
   * @returns An observable with the updated request
   * @author Diego Alonso Diaz Villalba
   */
  resubmit(id: number, resource: ResubmitRequestResource): Observable<Request> {
    return this.runAction(id, 'resubmit', resource, 'Failed to resubmit request');
  }

  /**
   * Cancels a request that is not resolved yet (POST /requests/{id}/cancel).
   *
   * @param id - The request identifier.
   * @param resource - The requester.
   * @returns An observable with the updated request
   * @author Diego Alonso Diaz Villalba
   */
  cancel(id: number, resource: ResolveRequestResource): Observable<Request> {
    return this.runAction(id, 'cancel', resource, 'Failed to cancel request');
  }

  /**
   * Posts an action of the request flow and converts the answer to an entity.
   *
   * @param id - The request identifier.
   * @param action - The last segment of the URL, e.g. 'approve'.
   * @param body - The body of the action.
   * @param operation - Description used in the error message.
   * @returns An observable with the updated request
   * @author Diego Alonso Diaz Villalba
   */
  private runAction(id: number, action: string, body: object, operation: string): Observable<Request> {
    return this.http.post<RequestResource>(`${this.endpointUrl}/${id}/${action}`, body).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(operation))
    );
  }
}
