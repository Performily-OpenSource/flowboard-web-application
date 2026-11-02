import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Position} from '../domain/model/position.entity';
import {
  CreatePositionRequest,
  PositionResource,
  PositionsResponse,
  UpdatePositionReferenceSalaryRequest
} from './positions-response';

/**
 * Assembler that converts between PositionResource (API) and Position (domain entity).
 * The resolved area is not mapped; only the areaId is transferred.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class PositionAssembler implements BaseAssembler<Position, PositionResource, PositionsResponse> {

  /**
   * Converts a PositionResource into a Position entity.
   *
   * @param resource - The resource returned by the API.
   * @returns The corresponding Position entity
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntityFromResource(resource: PositionResource): Position {
    return new Position({
      id: resource.id,
      title: resource.title,
      areaId: resource.areaId,
      referenceSalaryAmount: Number(resource.referenceSalaryAmount),
      referenceSalaryCurrency: resource.referenceSalaryCurrency,
      active: resource.active
    });
  }

  /**
   * Converts a Position entity into a PositionResource.
   *
   * @param entity - The entity to convert.
   * @returns The corresponding PositionResource
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Builds the payload of POST /positions.
   *
   * @param entity - The position to create.
   * @returns The CreatePositionRequest
   * @author Oscar Lizandro Vasquez Llave
   */
  toCreateRequestFromEntity(entity: Position): CreatePositionRequest {
    return {
      title: entity.title,
      areaId: entity.areaId,
      referenceSalaryAmount: entity.referenceSalaryAmount,
      referenceSalaryCurrency: entity.referenceSalaryCurrency
    };
  }

  /**
   * Builds the payload of PATCH /positions/{id}/reference-salary.
   *
   * @param entity - The position with the new reference salary.
   * @returns The UpdatePositionReferenceSalaryRequest
   * @author Oscar Lizandro Vasquez Llave
   */
  toReferenceSalaryRequestFromEntity(entity: Position): UpdatePositionReferenceSalaryRequest {
    return {
      referenceSalaryAmount: entity.referenceSalaryAmount,
      referenceSalaryCurrency: entity.referenceSalaryCurrency
    };
  }

  /**
   * Converts a PositionsResponse into a list of Position entities.
   *
   * @param response - The response whose 'positions' array is converted.
   * @returns The list of Position entities
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntitiesFromResponse(response: PositionsResponse): Position[] {
    return response.positions.map(resource => this.toEntityFromResource(resource));
  }
}
