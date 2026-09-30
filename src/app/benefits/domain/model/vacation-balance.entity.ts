import {VacationMovement, VacationMovementType} from './vacation-movement.entity';

/** Value object rule: days >= 0 with at most 2 decimals. */
const toDays = (value: number): number => Math.round(value * 100) / 100;

/**
 * Aggregate root: vacation days of one employee.
 * availableDays = accruedDays - usedDays and it is never negative.
 * Every change adds a VacationMovement (ACCRUAL, USAGE, REVERSAL, MANUAL_ADJUSTMENT).
 */
export class VacationBalance {
  private _id: number;
  private _employeeId: number;
  private _accruedDays: number;
  private _usedDays: number;
  private _movements: VacationMovement[];

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

  availableDays(): number {
    return toDays(this._accruedDays - this._usedDays);
  }

  /** Percentage of the accrued days that was already used (0 when nothing was accrued). */
  usagePercentage(): number {
    return this._accruedDays === 0 ? 0 : Math.round((this._usedDays / this._accruedDays) * 100);
  }

  hasEnough(days: number): boolean {
    return this.availableDays() >= toDays(days);
  }

  /** Accrual by seniority. */
  accrue(days: number): void {
    this.requirePositive(days);
    this._accruedDays = toDays(this._accruedDays + days);
    this.addMovement('ACCRUAL', days, 'Accrual by seniority', null, null);
  }

  /** Approved vacation request (called when Request emits RequestApproved). */
  debit(days: number, requestId: number): void {
    this.requirePositive(days);
    if (!this.hasEnough(days)) {
      throw new Error('Not enough vacation days available.');
    }
    this._usedDays = toDays(this._usedDays + days);
    this.addMovement('USAGE', -days, 'Approved vacation request', null, requestId);
  }

  /** Annulled approved request: gives the days back. */
  revertDebit(days: number, requestId: number): void {
    this.requirePositive(days);
    if (days > this._usedDays) {
      throw new Error('Cannot revert more days than the used ones.');
    }
    this._usedDays = toDays(this._usedDays - days);
    this.addMovement('REVERSAL', days, 'Annulled vacation request', null, requestId);
  }

  /** Available days after a manual adjustment, without changing the balance. */
  availableAfterAdjustment(days: number): number {
    return toDays(this.availableDays() + days);
  }

  /**
   * Manual adjustment made by HR. Positive days are added to the accrued days,
   * negative days are removed from them. Requires a reason and an author.
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

  private requirePositive(days: number): void {
    if (!(days > 0)) {
      throw new Error('The number of days must be greater than zero.');
    }
  }

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
