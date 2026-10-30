import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {BenefitPeriodicity, BenefitType, BenefitUnit} from '../domain/model/benefit-type.entity';
import {BenefitTypeResource, BenefitTypesResponse} from './benefit-types-response';
import {CreateBenefitTypeResource} from './benefits-command-resources';

/**
 * Transforms benefit type resources of the web service into domain entities and back.
 *
 * @remarks The web service does not send the periodicity yet, so the entity keeps it as null until
 * it does.
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
      description: resource.description ?? '',
      hasBalance: resource.hasBalance,
      unit: resource.unit as BenefitUnit,
      periodicity: (resource.periodicity ?? null) as BenefitPeriodicity | null,
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
    };
  }

  /**
   * Converts a new benefit type into the body of POST /benefit-types.
   * @param entity Benefit type to create.
   * @author Salym
   */
  toCreateResourceFromEntity(entity: BenefitType): CreateBenefitTypeResource {
    return {
      name: entity.name,
      description: entity.description || null,
      hasBalance: entity.hasBalance,
      unit: entity.unit
    };
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
