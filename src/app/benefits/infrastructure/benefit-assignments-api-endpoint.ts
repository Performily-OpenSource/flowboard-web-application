import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {
  AreaAssignmentPreviewResource,
  BenefitAssignmentBatchResource,
  BenefitAssignmentResource,
  BenefitAssignmentsResponse
} from './benefit-assignments-response';
import {BenefitAssignmentAssembler} from './benefit-assignment-assembler';
import {AssignBenefitResource, RegisterDeliveryResource} from './benefits-command-resources';
import {handleBenefitsWebServiceError} from './benefits-web-service-error';

/**
 * Path of the benefit assignments in the web service.
 *
 * @remarks environment.platformProviderBenefitAssignmentsEndpointPath still points to the path of the
 * fake API ('/benefit-assignments'); the web service publishes them under '/benefits'. When the
 * environments are updated this constant can be replaced by that value.
 * @author Salym
 */
const BENEFIT_ASSIGNMENTS_PATH = '/benefits';

/**
 * Result of assigning a benefit: the created assignments and who was skipped.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitAssignmentBatch {
  assignments: BenefitAssignment[];
  assignedCount: number;
  skippedEmployeeIds: number[];
}

/**
 * HTTP endpoint of the benefit assignments in the Flowboard Web Service (/benefits).
 *
 * @remarks Besides reading the assignments, it exposes one method per action of the web service:
 * assign (to an employee or to an area), preview an area assignment, register the delivery and
 * cancel. The web service changes the status, so the client never sends the whole assignment.
 * @author Salym
 */
export class BenefitAssignmentsApiEndpoint extends BaseApiEndpoint<BenefitAssignment, BenefitAssignmentResource,
  BenefitAssignmentsResponse, BenefitAssignmentAssembler> {

  /**
   * Initializes the endpoint with the benefit assignments URL of the web service.
   * @param http Angular HTTP client used to call the API.
   * @author Salym
   */
  constructor(http: HttpClient) {
    super(http, `${environment.webServiceApiBaseUrl}${BENEFIT_ASSIGNMENTS_PATH}`, new BenefitAssignmentAssembler());
  }

  /**
   * Keeps the reason sent by the web service in the error.
   * @param operation Description of the operation.
   * @author Salym
   */
  protected override handleError(operation: string) {
    return handleBenefitsWebServiceError(operation);
  }

  /**
   * Assigns a benefit to one employee or to every active employee of an area (POST /benefits).
   * @param resource Data of the assignment.
   * @returns An observable with the created assignments and the skipped employees
   * @author Salym
   */
  assign(resource: AssignBenefitResource): Observable<BenefitAssignmentBatch> {
    return this.http.post<BenefitAssignmentBatchResource>(this.endpointUrl, resource).pipe(
      map(batch => ({
        assignments: this.assembler.toEntitiesFromResources(batch.assignments),
        assignedCount: batch.assignedCount,
        skippedEmployeeIds: batch.skippedEmployeeIds ?? []
      })),
      catchError(this.handleError('Failed to assign benefit'))
    );
  }

  /**
   * Previews an assignment to an area (GET /benefits/area-preview).
   * @param benefitTypeId Identifier of the benefit type.
   * @param areaId Identifier of the area.
   * @param startDate First day of the validity (yyyy-MM-dd).
   * @param endDate Last day of the validity (yyyy-MM-dd).
   * @returns An observable with how many employees will receive the benefit and how many are skipped
   * @author Salym
   */
  previewAreaAssignment(benefitTypeId: number, areaId: number, startDate: string,
                        endDate: string): Observable<AreaAssignmentPreviewResource> {
    const params = new HttpParams()
      .set('benefitTypeId', benefitTypeId)
      .set('areaId', areaId)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<AreaAssignmentPreviewResource>(`${this.endpointUrl}/area-preview`, { params }).pipe(
      catchError(this.handleError('Failed to preview area assignment'))
    );
  }

  /**
   * Registers the delivery of an assignment (POST /benefits/{id}/deliveries).
   * @param id Identifier of the assignment.
   * @param resource Date, author and notes of the delivery.
   * @returns An observable with the delivered assignment
   * @author Salym
   */
  registerDelivery(id: number, resource: RegisterDeliveryResource): Observable<BenefitAssignment> {
    return this.http.post<BenefitAssignmentResource>(`${this.endpointUrl}/${id}/deliveries`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to register delivery'))
    );
  }

  /**
   * Cancels an assignment that was not delivered (PATCH /benefits/{id}/cancel).
   * @param id Identifier of the assignment.
   * @returns An observable with the cancelled assignment
   * @author Salym
   */
  cancel(id: number): Observable<BenefitAssignment> {
    return this.http.patch<BenefitAssignmentResource>(`${this.endpointUrl}/${id}/cancel`, null).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to cancel assignment'))
    );
  }
}
