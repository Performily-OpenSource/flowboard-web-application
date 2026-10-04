import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DateRange} from '../../shared/domain/model/date-range';
import {AssignmentStatus, BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {BenefitDelivery} from '../domain/model/benefit-delivery.entity';
import {BenefitAssignmentResource, BenefitAssignmentsResponse} from './benefit-assignments-response';

/**
 * Transforms benefit assignment resources between infrastructure and domain entities, including the
 * validity period and the delivery.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitAssignmentAssembler
  implements BaseAssembler<BenefitAssignment, BenefitAssignmentResource, BenefitAssignmentsResponse> {

  /**
   * Converts an API resource into a domain entity.
   * @param resource Resource received from or sent to the API.
   * @author Salym
   */
  toEntityFromResource(resource: BenefitAssignmentResource): BenefitAssignment {
    return new BenefitAssignment({
      id: resource.id,
      benefitTypeId: resource.benefitTypeId,
      employeeId: resource.employeeId,
      sourceAreaId: resource.sourceAreaId,
      validity: new DateRange(resource.validFrom, resource.validTo),
      quantity: resource.quantity,
      status: resource.status as AssignmentStatus,
      delivery: resource.delivery ? new BenefitDelivery(resource.delivery) : null
    });
  }

  /**
   * Converts a domain entity into an API resource.
   * @param entity Domain entity to convert.
   * @author Salym
   */
  toResourceFromEntity(entity: BenefitAssignment): BenefitAssignmentResource {
    const delivery = entity.delivery;
    return {
      id: entity.id,
      benefitTypeId: entity.benefitTypeId,
      employeeId: entity.employeeId,
      sourceAreaId: entity.sourceAreaId,
      validFrom: entity.validity.startDate,
      validTo: entity.validity.endDate,
      quantity: entity.quantity,
      status: entity.status,
      delivery: delivery ? {
        id: delivery.id,
        deliveredOn: delivery.deliveredOn,
        registeredBy: delivery.registeredBy,
        notes: delivery.notes
      } : null
    } as BenefitAssignmentResource;
  }

  /**
   * Converts an API response into a collection of entities.
   * @param response API response that wraps a collection of resources.
   * @author Salym
   */
  toEntitiesFromResponse(response: BenefitAssignmentsResponse): BenefitAssignment[] {
    return response.benefitAssignments.map(resource => this.toEntityFromResource(resource));
  }
}
