import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {BenefitTypesApiEndpoint} from './benefit-types-api-endpoint';
import {BenefitAssignmentsApiEndpoint} from './benefit-assignments-api-endpoint';
import {VacationBalancesApiEndpoint} from './vacation-balances-api-endpoint';

@Injectable({providedIn: 'root'})
/**
 * Facade that groups the endpoints of the Benefits context.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitsApi extends BaseApi {
  private readonly benefitTypesEndpoint: BenefitTypesApiEndpoint;
  private readonly benefitAssignmentsEndpoint: BenefitAssignmentsApiEndpoint;
  private readonly vacationBalancesEndpoint: VacationBalancesApiEndpoint;

  /**
   * Initializes the endpoints of benefit types, assignments and vacation balances.
   * @param http Angular HTTP client used to call the API.
   * @author Salym
   */
  constructor(http: HttpClient) {
    super();
    this.benefitTypesEndpoint = new BenefitTypesApiEndpoint(http);
    this.benefitAssignmentsEndpoint = new BenefitAssignmentsApiEndpoint(http);
    this.vacationBalancesEndpoint = new VacationBalancesApiEndpoint(http);
  }

  /**
   * Gets the benefit types of the catalog.
   * @author Salym
   */
  getBenefitTypes(): Observable<BenefitType[]> {
    return this.benefitTypesEndpoint.getAll();
  }

  /**
   * Creates a benefit type in the catalog.
   * @param benefitType Benefit type of the catalog.
   * @author Salym
   */
  createBenefitType(benefitType: BenefitType): Observable<BenefitType> {
    return this.benefitTypesEndpoint.create(benefitType);
  }

  /**
   * Updates a benefit type of the catalog.
   * @param benefitType Benefit type of the catalog.
   * @author Salym
   */
  updateBenefitType(benefitType: BenefitType): Observable<BenefitType> {
    return this.benefitTypesEndpoint.update(benefitType, benefitType.id);
  }

  /**
   * Gets the benefit assignments.
   * @author Salym
   */
  getBenefitAssignments(): Observable<BenefitAssignment[]> {
    return this.benefitAssignmentsEndpoint.getAll();
  }

  /**
   * Creates a benefit assignment.
   * @param assignment Benefit assignment to work with.
   * @author Salym
   */
  createBenefitAssignment(assignment: BenefitAssignment): Observable<BenefitAssignment> {
    return this.benefitAssignmentsEndpoint.create(assignment);
  }

  /**
   * Updates a benefit assignment (delivery or cancellation).
   * @param assignment Benefit assignment to work with.
   * @author Salym
   */
  updateBenefitAssignment(assignment: BenefitAssignment): Observable<BenefitAssignment> {
    return this.benefitAssignmentsEndpoint.update(assignment, assignment.id);
  }

  /**
   * Gets the vacation balances of the employees.
   * @author Salym
   */
  getVacationBalances(): Observable<VacationBalance[]> {
    return this.vacationBalancesEndpoint.getAll();
  }

  /**
   * Saves a vacation balance with its movements.
   * @param balance Vacation balance of the employee.
   * @author Salym
   */
  updateVacationBalance(balance: VacationBalance): Observable<VacationBalance> {
    return this.vacationBalancesEndpoint.update(balance, balance.id);
  }
}
