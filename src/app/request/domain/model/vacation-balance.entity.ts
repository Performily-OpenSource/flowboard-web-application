
/**
 * Read model of the vacation balance of an employee, used to validate vacation requests (US30).
 *
 * @remarks Built by the BenefitsAcl from the balances of the Benefits bounded context.
 * @author Diego Alonso Diaz Villalba
 */
export class VacationBalance {
  private _id: number;
  private _employeeId: number;
  private _accruedDays: number;
  private _usedDays: number;

  /**
   * Creates a new VacationBalance.
   *
   * @param props - The balance data: identifier, employee, accrued days and used days.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(props: { id: number; employeeId: number; accruedDays: number; usedDays: number }) {
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._accruedDays = props.accruedDays;
    this._usedDays = props.usedDays;
  }

  /** Identifier of the balance in Benefits. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Identifier of the employee who owns the balance. */
  get employeeId(): number {
    return this._employeeId;
  }

  set employeeId(value: number) {
    this._employeeId = value;
  }

  /** Vacation days accrued by the employee. */
  get accruedDays(): number {
    return this._accruedDays;
  }

  set accruedDays(value: number) {
    this._accruedDays = value;
  }

  /** Vacation days already used. */
  get usedDays(): number {
    return this._usedDays;
  }

  set usedDays(value: number) {
    this._usedDays = value;
  }

  /** Days still available: accrued minus used, never below 0. */
  get availableDays(): number {
    return Math.max(0, this._accruedDays - this._usedDays);
  }

  /**
   * Checks whether the balance covers a number of days.
   *
   * @param days - The days requested.
   * @returns True if the available days are enough, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  hasEnough(days: number): boolean {
    return this.availableDays >= days;
  }

  /**
   * Calculates the days that would remain after a request.
   *
   * @param days - The days requested.
   * @returns The remaining days, never below 0
   * @author Diego Alonso Diaz Villalba
   */
  availableAfter(days: number): number {
    return Math.max(0, this.availableDays - days);
  }
}
