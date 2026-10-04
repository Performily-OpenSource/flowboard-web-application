import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationMovement, VacationMovementType} from '../domain/model/vacation-movement.entity';
import {VacationBalanceResource, VacationBalancesResponse} from './vacation-balances-response';

/**
 * Transforms vacation balance resources between infrastructure and domain entities, including their
 * movements.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class VacationBalanceAssembler
  implements BaseAssembler<VacationBalance, VacationBalanceResource, VacationBalancesResponse> {

  /**
   * Converts an API resource into a domain entity.
   * @param resource Resource received from or sent to the API.
   * @author Salym
   */
  toEntityFromResource(resource: VacationBalanceResource): VacationBalance {
    return new VacationBalance({
      id: resource.id,
      employeeId: resource.employeeId,
      accruedDays: resource.accruedDays,
      usedDays: resource.usedDays,
      movements: (resource.movements ?? []).map(movement => new VacationMovement({
        id: movement.id,
        type: movement.type as VacationMovementType,
        days: movement.days,
        reason: movement.reason,
        authorId: movement.authorId,
        requestId: movement.requestId,
        occurredAt: movement.occurredAt
      }))
    });
  }

  /**
   * Converts a domain entity into an API resource.
   * @param entity Domain entity to convert.
   * @author Salym
   */
  toResourceFromEntity(entity: VacationBalance): VacationBalanceResource {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      accruedDays: entity.accruedDays,
      usedDays: entity.usedDays,
      movements: entity.movements.map(movement => ({
        id: movement.id,
        type: movement.type,
        days: movement.days,
        reason: movement.reason,
        authorId: movement.authorId,
        requestId: movement.requestId,
        occurredAt: movement.occurredAt
      }))
    } as VacationBalanceResource;
  }

  /**
   * Converts an API response into a collection of entities.
   * @param response API response that wraps a collection of resources.
   * @author Salym
   */
  toEntitiesFromResponse(response: VacationBalancesResponse): VacationBalance[] {
    return response.vacationBalances.map(resource => this.toEntityFromResource(resource));
  }
}
