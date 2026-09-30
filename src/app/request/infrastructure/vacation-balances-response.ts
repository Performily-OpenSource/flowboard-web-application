import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface VacationBalanceResource extends BaseResource {
  id: number;
  employeeId: number;
  accruedDays: number;
  usedDays: number;
}

export interface VacationBalancesResponse extends BaseResponse {
  vacationBalances: VacationBalanceResource[];
}
