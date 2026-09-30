import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DateRange} from '../../shared/domain/model/date-range';
import {AssignmentStatus, BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {BenefitDelivery} from '../domain/model/benefit-delivery.entity';
import {BenefitAssignmentResource, BenefitAssignmentsResponse} from './benefit-assignments-response';

export class BenefitAssignmentAssembler
  implements BaseAssembler<BenefitAssignment, BenefitAssignmentResource, BenefitAssignmentsResponse> {

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

  toEntitiesFromResponse(response: BenefitAssignmentsResponse): BenefitAssignment[] {
    return response.benefitAssignments.map(resource => this.toEntityFromResource(resource));
  }
}
