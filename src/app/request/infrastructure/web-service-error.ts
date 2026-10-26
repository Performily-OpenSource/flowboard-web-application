import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

/**
 * Error body returned by the Flowboard Web Service (ErrorResource).
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface WebServiceErrorResource {
  code: string;
  message: string;
  details?: string;
}

/**
 * Builds the error handler used by the endpoints of Request that call the web service.
 *
 * @remarks Unlike the generic handler of BaseApiEndpoint, it keeps the reason the web service sends
 * in 'details' (or its 'message'), so the views can show why an action was not allowed.
 * @param operation - Description of the operation, used when the web service does not answer.
 * @returns A function that converts the HttpErrorResponse into an Error with a readable message
 * @author Diego Alonso Diaz Villalba
 */
export function handleWebServiceError(operation: string) {
  return (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 0) {
      return throwError(() => new Error(`${operation}: the web service is not available`));
    }
    const body = error.error as Partial<WebServiceErrorResource> | null;
    const reason = body?.details || body?.message || error.statusText || 'Unexpected error';
    return throwError(() => new Error(reason));
  };
}
