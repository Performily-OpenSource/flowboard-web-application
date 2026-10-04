import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {BenefitPeriodicity, BenefitType, BenefitUnit} from '../domain/model/benefit-type.entity';
import {BenefitTypeResource, BenefitTypesResponse} from './benefit-types-response';

/**
 * Transforms benefit type resources between infrastructure and domain entities.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitTypeAssembler implements BaseAssembler<BenefitType, BenefitTypeResource, BenefitTypesResponse> {

  /**
   * Converts an API resource into a domain entity.
   * @param resource Resource received from or sent to the API.
   * @author Salym
   */
  toEntityFromResource(resource: BenefitTypeResource): BenefitType {
    return new BenefitType({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      hasBalance: resource.hasBalance,
      unit: resource.unit as BenefitUnit,
      periodicity: resource.periodicity as BenefitPeriodicity,
      active: resource.active
    });
  }

  /**
   * Converts a domain entity into an API resource.
   * @param entity Domain entity to convert.
   * @author Salym
   */
  toResourceFromEntity(entity: BenefitType): BenefitTypeResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      hasBalance: entity.hasBalance,
      unit: entity.unit,
      periodicity: entity.periodicity,
      active: entity.active
    } as BenefitTypeResource;
  }

  /**
   * Converts an API response into a collection of entities.
   * @param response API response that wraps a collection of resources.
   * @author Salym
   */
  toEntitiesFromResponse(response: BenefitTypesResponse): BenefitType[] {
    return response.benefitTypes.map(resource => this.toEntityFromResource(resource));
  }
}
