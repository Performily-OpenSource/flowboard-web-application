/**
 * Represents a vacation movement received from the web service (VacationMovementResource).
 *
 * @remarks days is signed: positive adds available days, negative removes them.
 * @author Salym
 */
export interface VacationMovementResource {
  id: number;
  type: string;
  days: number;
  reason: string | null;
  authorId: number | null;
  authorName: string | null;
  requestId: number | null;
  occurredAt: string;
}

/**
 * Represents a vacation balance received from the web service (VacationBalanceResource).
 *
 * @remarks The web service identifies a balance by its employee, so there is no id. The list of
 * balances sends the movements empty; they come with GET /vacation-balances/{employeeId}/movements.
 * @author Salym
 */
export interface VacationBalanceResource {
  employeeId: number;
  employeeName: string | null;
  areaName: string | null;
  accruedDays: number;
  usedDays: number;
  availableDays: number;
  lastAccrualDate: string | null;
  movements: VacationMovementResource[];
}
