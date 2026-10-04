import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Represents a vacation movement received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface VacationMovementResource {
  id: number;
  type: string;
  days: number;
  reason: string;
  authorId: number | null;
  requestId: number | null;
  occurredAt: string;
}

/**
 * Represents a vacation balance received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface VacationBalanceResource extends BaseResource {
  id: number;
  employeeId: number;
  accruedDays: number;
  usedDays: number;
  movements: VacationMovementResource[];
}

/**
 * API response containing vacation balances.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface VacationBalancesResponse extends BaseResponse {
  vacationBalances: VacationBalanceResource[];
}
