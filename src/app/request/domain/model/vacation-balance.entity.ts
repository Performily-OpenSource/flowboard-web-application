
export class VacationBalance {
  private _id: number;
  private _employeeId: number;
  private _accruedDays: number;
  private _usedDays: number;

  constructor(props: { id: number; employeeId: number; accruedDays: number; usedDays: number }) {
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._accruedDays = props.accruedDays;
    this._usedDays = props.usedDays;
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

  set employeeId(value: number) {
    this._employeeId = value;
  }

  get accruedDays(): number {
    return this._accruedDays;
  }

  set accruedDays(value: number) {
    this._accruedDays = value;
  }

  get usedDays(): number {
    return this._usedDays;
  }

  set usedDays(value: number) {
    this._usedDays = value;
  }

  get availableDays(): number {
    return Math.max(0, this._accruedDays - this._usedDays);
  }

  hasEnough(days: number): boolean {
    return this.availableDays >= days;
  }

  availableAfter(days: number): number {
    return Math.max(0, this.availableDays - days);
  }
}
