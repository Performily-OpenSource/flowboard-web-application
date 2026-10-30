import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {BenefitTypesApiEndpoint} from './benefit-types-api-endpoint';
import {BenefitAssignmentBatch, BenefitAssignmentsApiEndpoint} from './benefit-assignments-api-endpoint';
import {VacationBalancesApiEndpoint} from './vacation-balances-api-endpoint';
import {AreaAssignmentPreviewResource} from './benefit-assignments-response';
import {VacationMovement} from '../domain/model/vacation-movement.entity';
import {AssignBenefitResource, AdjustVacationBalanceResource, RegisterDeliveryResource} from './benefits-command-resources';

@Injectable({providedIn: 'root'})
/**
 * Facade that groups the endpoints of the Benefits context in the Flowboard Web Service.
 *
 * @remarks Every write goes through an action of the web service (create, activate, deactivate,
 * assign, register delivery, cancel, adjust), never through a PUT of the whole object.
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
    return this.benefitTypesEndpoint.createBenefitType(benefitType);
  }

  /**
   * Updates a benefit type of the catalog (PUT /benefit-types/{id}).
   * @param benefitType Benefit type of the catalog.
   * @remarks Ready for when the web service publishes PUT /benefit-types/{id}; today it does not
   * exist, so the catalog hides the edit action and this method is not called.
   * @author Salym
   */
  updateBenefitType(benefitType: BenefitType): Observable<BenefitType> {
    return this.benefitTypesEndpoint.update(benefitType, benefitType.id);
  }

  /**
   * Activates a benefit type of the catalog.
   * @param id Identifier of the benefit type.
   * @author Salym
   */
  activateBenefitType(id: number): Observable<BenefitType> {
    return this.benefitTypesEndpoint.activate(id);
  }

  /**
   * Deactivates a benefit type of the catalog.
   * @param id Identifier of the benefit type.
   * @author Salym
   */
  deactivateBenefitType(id: number): Observable<BenefitType> {
    return this.benefitTypesEndpoint.deactivate(id);
  }

  /**
   * Gets the benefit assignments.
   * @author Salym
   */
  getBenefitAssignments(): Observable<BenefitAssignment[]> {
    return this.benefitAssignmentsEndpoint.getAll();
  }

  /**
   * Assigns a benefit to one employee or to an area.
   * @param resource Data of the assignment.
   * @author Salym
   */
  assignBenefit(resource: AssignBenefitResource): Observable<BenefitAssignmentBatch> {
    return this.benefitAssignmentsEndpoint.assign(resource);
  }

  /**
   * Previews an assignment to an area.
   * @param benefitTypeId Identifier of the benefit type.
   * @param areaId Identifier of the area.
   * @param startDate First day of the validity (yyyy-MM-dd).
   * @param endDate Last day of the validity (yyyy-MM-dd).
   * @author Salym
   */
  previewAreaAssignment(benefitTypeId: number, areaId: number, startDate: string,
                        endDate: string): Observable<AreaAssignmentPreviewResource> {
    return this.benefitAssignmentsEndpoint.previewAreaAssignment(benefitTypeId, areaId, startDate, endDate);
  }

  /**
   * Registers the delivery of an assignment.
   * @param assignmentId Identifier of the assignment.
   * @param resource Date, author and notes of the delivery.
   * @author Salym
   */
  registerDelivery(assignmentId: number, resource: RegisterDeliveryResource): Observable<BenefitAssignment> {
    return this.benefitAssignmentsEndpoint.registerDelivery(assignmentId, resource);
  }

  /**
   * Cancels an assignment that was not delivered.
   * @param assignmentId Identifier of the assignment.
   * @author Salym
   */
  cancelAssignment(assignmentId: number): Observable<BenefitAssignment> {
    return this.benefitAssignmentsEndpoint.cancel(assignmentId);
  }

  /**
   * Gets the vacation balances of the active employees.
   * @author Salym
   */
  getVacationBalances(): Observable<VacationBalance[]> {
    return this.vacationBalancesEndpoint.getAll();
  }

  /**
   * Gets the movements of the vacation balance of an employee.
   * @param employeeId Identifier of the employee.
   * @author Salym
   */
  getVacationMovements(employeeId: number): Observable<VacationMovement[]> {
    return this.vacationBalancesEndpoint.getMovements(employeeId);
  }

  /**
   * Adjusts a vacation balance manually.
   * @param employeeId Identifier of the employee.
   * @param resource Operation, days, reason and author of the adjustment.
   * @author Salym
   */
  adjustVacationBalance(employeeId: number, resource: AdjustVacationBalanceResource): Observable<VacationBalance> {
    return this.vacationBalancesEndpoint.adjust(employeeId, resource);
  }
}
