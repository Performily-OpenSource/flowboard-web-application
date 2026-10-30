import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationMovement} from '../domain/model/vacation-movement.entity';
import {VacationBalanceResource, VacationMovementResource} from './vacation-balances-response';
import {VacationBalanceAssembler} from './vacation-balance-assembler';
import {AdjustVacationBalanceResource} from './benefits-command-resources';
import {handleBenefitsWebServiceError} from './benefits-web-service-error';

/**
 * HTTP endpoint of the vacation balances in the Flowboard Web Service (/vacation-balances).
 *
 * @remarks It does not extend BaseApiEndpoint because a balance has no id (the web service uses the
 * employee) and it is never created, replaced or deleted by the client. Usage and reversal have no
 * endpoint: the web service applies them when a vacation request is approved or cancelled.
 * @author Salym
 */
export class VacationBalancesApiEndpoint {
  private readonly endpointUrl =
    `${environment.webServiceApiBaseUrl}${environment.platformProviderVacationBalancesEndpointPath}`;
  private readonly assembler = new VacationBalanceAssembler();

  /**
   * Initializes the endpoint.
   * @param http Angular HTTP client used to call the API.
   * @author Salym
   */
  constructor(private http: HttpClient) {}

  /**
   * Gets the vacation balances of the active employees (GET /vacation-balances), without movements.
   * @returns An observable with the balances
   * @author Salym
   */
  getAll(): Observable<VacationBalance[]> {
    return this.http.get<VacationBalanceResource[]>(this.endpointUrl).pipe(
      map(resources => this.assembler.toEntitiesFromResources(resources)),
      catchError(handleBenefitsWebServiceError('Failed to get vacation balances'))
    );
  }

  /**
   * Gets the vacation balance of an employee with its movements (GET /vacation-balances/{employeeId}).
   * @param employeeId Identifier of the employee.
   * @returns An observable with the balance
   * @author Salym
   */
  getByEmployeeId(employeeId: number): Observable<VacationBalance> {
    return this.http.get<VacationBalanceResource>(`${this.endpointUrl}/${employeeId}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(handleBenefitsWebServiceError('Failed to get vacation balance'))
    );
  }

  /**
   * Gets the movements of the vacation balance of an employee (GET /vacation-balances/{employeeId}/movements).
   * @param employeeId Identifier of the employee.
   * @returns An observable with the movements, newest first
   * @author Salym
   */
  getMovements(employeeId: number): Observable<VacationMovement[]> {
    return this.http.get<VacationMovementResource[]>(`${this.endpointUrl}/${employeeId}/movements`).pipe(
      map(resources => this.assembler.toMovementsFromResources(resources)),
      catchError(handleBenefitsWebServiceError('Failed to get vacation movements'))
    );
  }

  /**
   * Adjusts a vacation balance manually (POST /vacation-balances/{employeeId}/adjustments).
   * @param employeeId Identifier of the employee.
   * @param resource Operation, days, reason and author of the adjustment.
   * @returns An observable with the adjusted balance and its movements
   * @author Salym
   */
  adjust(employeeId: number, resource: AdjustVacationBalanceResource): Observable<VacationBalance> {
    return this.http.post<VacationBalanceResource>(`${this.endpointUrl}/${employeeId}/adjustments`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(handleBenefitsWebServiceError('Failed to adjust vacation balance'))
    );
  }
}
