import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationMovement, VacationMovementType} from '../domain/model/vacation-movement.entity';
import {VacationBalanceResource, VacationBalancesResponse} from './vacation-balances-response';

export class VacationBalanceAssembler
  implements BaseAssembler<VacationBalance, VacationBalanceResource, VacationBalancesResponse> {

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

  toEntitiesFromResponse(response: VacationBalancesResponse): VacationBalance[] {
    return response.vacationBalances.map(resource => this.toEntityFromResource(resource));
  }
}
