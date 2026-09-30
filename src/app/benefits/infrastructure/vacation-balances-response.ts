import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface VacationMovementResource {
  id: number;
  type: string;
  days: number;
  reason: string;
  authorId: number | null;
  requestId: number | null;
  occurredAt: string;
}

export interface VacationBalanceResource extends BaseResource {
  id: number;
  employeeId: number;
  accruedDays: number;
  usedDays: number;
  movements: VacationMovementResource[];
}

export interface VacationBalancesResponse extends BaseResponse {
  vacationBalances: VacationBalanceResource[];
}
