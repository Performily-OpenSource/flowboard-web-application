import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

/**
 * Error body returned by the Flowboard Web Service (ErrorResource).
 *
 * @remarks Same contract as the ErrorResource of the shared kernel of the web service.
 * @author Salym
 */
export interface BenefitsWebServiceErrorResource {
  code: string;
  message: string;
  details?: string | null;
}

/**
 * Error raised by the Benefits endpoints when the web service rejects a call.
 *
 * @remarks Keeps the HTTP status and the code of the web service, so the store can translate the
 * known business rules (409 name taken, 409 overlap, 422 negative balance, 422 inactive) to the i18n
 * keys of the context and show the reason of the web service for the rest. The message is the
 * 'details' of the web service, or its 'message' when there are no details.
 * @author Salym
 */
export class BenefitsWebServiceError extends Error {
  /**
   * Creates the error.
   * @param status HTTP status of the answer, 0 when the web service did not answer.
   * @param code Code of the web service, e.g. 'BUSINESS_RULE_VIOLATION', or null.
   * @param reason Readable reason of the web service.
   * @author Salym
   */
  constructor(readonly status: number, readonly code: string | null, reason: string) {
    super(reason);
    this.name = 'BenefitsWebServiceError';
  }

  /**
   * Determines whether the web service could not be reached.
   * @author Salym
   */
  isUnavailable(): boolean {
    return this.status === 0;
  }
}

/**
 * Builds the error handler used by the Benefits endpoints that call the web service.
 *
 * @remarks Follows the same idea as the handler of Request, but in a file of Benefits so both
 * contexts stay independent. Unlike the generic handler of BaseApiEndpoint, it keeps the reason the
 * web service sends.
 * @param operation Description of the operation, used when the web service does not answer.
 * @returns A function that converts the HttpErrorResponse into a BenefitsWebServiceError
 * @author Salym
 */
export function handleBenefitsWebServiceError(operation: string) {
  return (error: HttpErrorResponse): Observable<never> => {
    if (error.status === 0) {
      return throwError(() => new BenefitsWebServiceError(0, null, `${operation}: the web service is not available`));
    }
    const body = error.error as Partial<BenefitsWebServiceErrorResource> | null;
    const reason = body?.details || body?.message || error.statusText || 'Unexpected error';
    return throwError(() => new BenefitsWebServiceError(error.status, body?.code ?? null, reason));
  };
}
