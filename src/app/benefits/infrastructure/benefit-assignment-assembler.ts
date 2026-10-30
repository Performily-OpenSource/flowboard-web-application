import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DateRange} from '../../shared/domain/model/date-range';
import {AssignmentStatus, BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {BenefitDelivery} from '../domain/model/benefit-delivery.entity';
import {BenefitAssignmentResource, BenefitAssignmentsResponse} from './benefit-assignments-response';

/**
 * Transforms benefit assignment resources of the web service into domain entities and back,
 * including the validity period and the delivery.
 *
 * @remarks The delivery has no id in the web service, so the entity uses the id of its assignment.
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
      validity: new DateRange(resource.startDate, resource.endDate),
      quantity: Number(resource.quantity),
      status: resource.status as AssignmentStatus,
      delivery: resource.delivery ? new BenefitDelivery({
        id: resource.id,
        deliveredOn: resource.delivery.deliveredOn,
        registeredBy: resource.delivery.registeredById,
        notes: resource.delivery.notes ?? ''
      }) : null
    });
  }

  /**
   * Converts a domain entity into an API resource.
   * @param entity Domain entity to convert.
   * @remarks The names and the display quantity are calculated by the web service, so they are not
   * filled here.
   * @author Salym
   */
  toResourceFromEntity(entity: BenefitAssignment): BenefitAssignmentResource {
    const delivery = entity.delivery;
    return {
      id: entity.id,
      benefitTypeId: entity.benefitTypeId,
      benefitTypeName: entity.benefitType?.name ?? '',
      unit: entity.benefitType?.unit ?? '',
      employeeId: entity.employeeId,
      employeeName: null,
      sourceAreaId: entity.sourceAreaId,
      quantity: entity.quantity,
      displayQuantity: '',
      startDate: entity.validity.startDate,
      endDate: entity.validity.endDate,
      status: entity.status,
      delivery: delivery ? {
        deliveredOn: delivery.deliveredOn,
        registeredById: delivery.registeredBy,
        notes: delivery.notes
      } : null
    };
  }

  /**
   * Converts a list of resources of the web service into entities.
   * @param resources Resources received from the web service.
   * @author Salym
   */
  toEntitiesFromResources(resources: BenefitAssignmentResource[]): BenefitAssignment[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts an API response into a collection of entities.
   * @param response API response that wraps a collection of resources.
   * @author Salym
   */
  toEntitiesFromResponse(response: BenefitAssignmentsResponse): BenefitAssignment[] {
    return this.toEntitiesFromResources(response.benefitAssignments);
  }
}
