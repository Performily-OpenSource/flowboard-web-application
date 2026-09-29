import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Position} from '../domain/model/position.entity';
import {PositionResource, PositionsResponse} from './positions-response';

export class PositionAssembler implements BaseAssembler<Position, PositionResource, PositionsResponse> {

  toEntityFromResource(resource: PositionResource): Position {
    return new Position({
      id: resource.id,
      title: resource.title,
      areaId: resource.areaId,
      referenceSalaryAmount: resource.referenceSalaryAmount,
      referenceSalaryCurrency: resource.referenceSalaryCurrency,
      active: resource.active
    });
  }

  toResourceFromEntity(entity: Position): PositionResource {
    return {
      id: entity.id,
      title: entity.title,
      areaId: entity.areaId,
      referenceSalaryAmount: entity.referenceSalaryAmount,
      referenceSalaryCurrency: entity.referenceSalaryCurrency,
      active: entity.active
    } as PositionResource;
  }

  toEntitiesFromResponse(response: PositionsResponse): Position[] {
    return response.positions.map(resource => this.toEntityFromResource(resource));
  }
}
