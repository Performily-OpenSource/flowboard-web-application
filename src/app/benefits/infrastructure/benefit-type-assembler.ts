import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {BenefitPeriodicity, BenefitType, BenefitUnit} from '../domain/model/benefit-type.entity';
import {BenefitTypeResource, BenefitTypesResponse} from './benefit-types-response';

export class BenefitTypeAssembler implements BaseAssembler<BenefitType, BenefitTypeResource, BenefitTypesResponse> {

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

  toEntitiesFromResponse(response: BenefitTypesResponse): BenefitType[] {
    return response.benefitTypes.map(resource => this.toEntityFromResource(resource));
  }
}
