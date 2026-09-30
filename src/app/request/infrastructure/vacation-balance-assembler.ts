import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationBalanceResource, VacationBalancesResponse} from './vacation-balances-response';

export class VacationBalanceAssembler implements BaseAssembler<VacationBalance, VacationBalanceResource, VacationBalancesResponse> {

  toEntityFromResource(resource: VacationBalanceResource): VacationBalance {
    return new VacationBalance({
      id: resource.id,
      employeeId: resource.employeeId,
      accruedDays: Number(resource.accruedDays),
      usedDays: Number(resource.usedDays)
    });
  }

  toResourceFromEntity(entity: VacationBalance): VacationBalanceResource {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      accruedDays: entity.accruedDays,
      usedDays: entity.usedDays
    };
  }

  toEntitiesFromResponse(response: VacationBalancesResponse): VacationBalance[] {
    return response.vacationBalances.map(resource => this.toEntityFromResource(resource));
  }
}
