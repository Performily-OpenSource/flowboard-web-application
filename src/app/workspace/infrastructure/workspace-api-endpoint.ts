import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BaseEntity} from '../../shared/domain/model/base-entity';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {BaseAssembler} from '../../shared/infrastructure/base-assembler';

/** Base URL used when the environment does not define webServiceApiBaseUrl. */
const DEFAULT_WEB_SERVICE_BASE_URL = 'http://localhost:8080';

/**
 * Builds the URL of a Workspace resource of the flowboard-web-service (Spring Boot).
 *
 * @remarks The base comes from environment.webServiceApiBaseUrl. A trailing '/api/v1' in that value is tolerated.
 * @param path - Path after '/api/v1', for example '/employees'.
 * @returns The absolute URL of the resource.
 * @author Oscar Lizandro Vasquez Llave
 */
export function workspaceApiUrl(path: string): string {
  const configured = (environment as Record<string, unknown>)['webServiceApiBaseUrl'];
  const base = (typeof configured === 'string' && configured ? configured : DEFAULT_WEB_SERVICE_BASE_URL)
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/, '');
  return `${base}/api/v1${path}`;
}

/**
 * Base class of the Workspace endpoints that talk to the flowboard-web-service.
 *
 * @remarks Replaces the generic error message with the one returned by the backend (ErrorResource.message).
 * @author Oscar Lizandro Vasquez Llave
 */
export abstract class WorkspaceApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>
> extends BaseApiEndpoint<TEntity, TResource, TResponse, TAssembler> {

  /**
   * Builds the error handler used by every request of the endpoint.
   *
   * @param operation - Description of the failed operation.
   * @returns A function that turns an HttpErrorResponse into an Error with the backend message when there is one.
   * @author Oscar Lizandro Vasquez Llave
   */
  protected override handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const backendMessage = typeof error.error?.message === 'string' ? error.error.message : null;
      const reason = error.status === 0
        ? 'The server is not reachable'
        : backendMessage ?? (error.statusText || 'Unexpected error');
      return throwError(() => new Error(`${operation}: ${reason}`));
    };
  }
}
