import {VacationMovement, VacationMovementType} from './vacation-movement.entity';

/** Value object rule: days >= 0 with at most 2 decimals. */
const toDays = (value: number): number => Math.round(value * 100) / 100;

/**
 * Aggregate root with the vacation days of one employee. availableDays = accruedDays - usedDays and
 * it is never negative. Every change adds a VacationMovement (ACCRUAL, USAGE, REVERSAL,
 * MANUAL_ADJUSTMENT).
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class VacationBalance {
  private _id: number;
  private _employeeId: number;
  private _accruedDays: number;
  private _usedDays: number;
  private _movements: VacationMovement[];

  /**
   * Initializes the balance and validates that it is not negative.
   * @param props Initial values of the instance.
   * @author Salym
   */
  constructor(props: {
    id: number;
    employeeId: number;
    accruedDays: number;
    usedDays: number;
    movements?: VacationMovement[];
  }) {
    if (props.accruedDays < 0 || props.usedDays < 0 || props.usedDays > props.accruedDays) {
      throw new Error('A vacation balance cannot be negative.');
    }
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._accruedDays = toDays(props.accruedDays);
    this._usedDays = toDays(props.usedDays);
    this._movements = props.movements ?? [];
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get employeeId(): number {
    return this._employeeId;
  }

  get accruedDays(): number {
    return this._accruedDays;
  }

  get usedDays(): number {
    return this._usedDays;
  }

  get movements(): VacationMovement[] {
    return [...this._movements];
  }

  /**
   * Calculates the available days (accrued minus used).
   * @author Salym
   */
  availableDays(): number {
    return toDays(this._accruedDays - this._usedDays);
  }

  /**
   * Calculates the percentage of the accrued days that was already used (0 when nothing was
   * accrued).
   * @author Salym
   */
  usagePercentage(): number {
    return this._accruedDays === 0 ? 0 : Math.round((this._usedDays / this._accruedDays) * 100);
  }

  /**
   * Determines whether the balance has enough available days.
   * @param days Number of days requested.
   * @author Salym
   */
  hasEnough(days: number): boolean {
    return this.availableDays() >= toDays(days);
  }

  /**
   * Adds days accrued by seniority and registers an ACCRUAL movement.
   * @param days Number of vacation days (up to 2 decimals).
   * @author Salym
   */
  accrue(days: number): void {
    this.requirePositive(days);
    this._accruedDays = toDays(this._accruedDays + days);
    this.addMovement('ACCRUAL', days, 'Accrual by seniority', null, null);
  }

  /**
   * Discounts the days of an approved vacation request and registers a USAGE movement. It is
   * rejected when there are not enough available days.
   * @param days Number of vacation days (up to 2 decimals).
   * @param requestId Identifier of the vacation request (RequestId of the Shared Kernel).
   * @author Salym
   */
  debit(days: number, requestId: number): void {
    this.requirePositive(days);
    if (!this.hasEnough(days)) {
      throw new Error('Not enough vacation days available.');
    }
    this._usedDays = toDays(this._usedDays + days);
    this.addMovement('USAGE', -days, 'Approved vacation request', null, requestId);
  }

  /**
   * Gives back the days of an annulled approved request and registers a REVERSAL movement.
   * @param days Number of vacation days (up to 2 decimals).
   * @param requestId Identifier of the vacation request (RequestId of the Shared Kernel).
   * @author Salym
   */
  revertDebit(days: number, requestId: number): void {
    this.requirePositive(days);
    if (days > this._usedDays) {
      throw new Error('Cannot revert more days than the used ones.');
    }
    this._usedDays = toDays(this._usedDays - days);
    this.addMovement('REVERSAL', days, 'Annulled vacation request', null, requestId);
  }

  /**
   * Calculates the available days after a manual adjustment, without changing the balance.
   * @param days Signed days of the adjustment: positive adds, negative removes.
   * @author Salym
   */
  availableAfterAdjustment(days: number): number {
    return toDays(this.availableDays() + days);
  }

  /**
   * Applies a manual adjustment made by HR and registers a MANUAL_ADJUSTMENT movement. It requires
   * a reason and an author and never leaves the balance negative.
   * @param days Signed days of the adjustment: positive adds, negative removes.
   * @param reason Reason of the change, kept in the movement history.
   * @param authorId Identifier of the employee that makes the adjustment.
   * @author Salym
   */
  adjust(days: number, reason: string, authorId: number): void {
    if (days === 0) {
      throw new Error('The adjustment must change the balance.');
    }
    if (!reason?.trim()) {
      throw new Error('The adjustment requires a reason.');
    }
    if (!authorId) {
      throw new Error('The adjustment requires an author.');
    }
    if (this.availableAfterAdjustment(days) < 0) {
      throw new Error('The available days cannot be negative.');
    }
    this._accruedDays = toDays(this._accruedDays + days);
    this.addMovement('MANUAL_ADJUSTMENT', days, reason.trim(), authorId, null);
  }

  /**
   * Validates that a number of days is greater than zero.
   * @param days Number of vacation days (up to 2 decimals).
   * @author Salym
   */
  private requirePositive(days: number): void {
    if (!(days > 0)) {
      throw new Error('The number of days must be greater than zero.');
    }
  }

  /**
   * Adds a movement to the history of the balance.
   * @param type Type of the movement.
   * @param days Signed days of the movement.
   * @param reason Reason of the change, kept in the movement history.
   * @param authorId Identifier of the employee that makes the adjustment.
   * @param requestId Identifier of the vacation request (RequestId of the Shared Kernel).
   * @author Salym
   */
  private addMovement(type: VacationMovementType, days: number, reason: string,
                      authorId: number | null, requestId: number | null): void {
    this._movements = [...this._movements, new VacationMovement({
      id: Date.now(),
      type,
      days: toDays(days),
      reason,
      authorId,
      requestId,
      occurredAt: new Date().toISOString()
    })];
  }
}
