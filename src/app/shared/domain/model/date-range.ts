/**
 * Shared Kernel value object: a closed range of calendar dates (ISO yyyy-MM-dd).
 * Rules: startDate and endDate are required and endDate cannot be before startDate.
 */
export class DateRange {
  private readonly _startDate: string;
  private readonly _endDate: string;

  constructor(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      throw new Error('DateRange requires a start date and an end date.');
    }
    if (endDate < startDate) {
      throw new Error('The end date cannot be before the start date.');
    }
    this._startDate = startDate.substring(0, 10);
    this._endDate = endDate.substring(0, 10);
  }

  static isValid(startDate: string | null | undefined, endDate: string | null | undefined): boolean {
    return !!startDate && !!endDate && endDate >= startDate;
  }

  get startDate(): string {
    return this._startDate;
  }

  get endDate(): string {
    return this._endDate;
  }

  contains(date: string): boolean {
    const day = date.substring(0, 10);
    return day >= this._startDate && day <= this._endDate;
  }

  overlaps(other: DateRange): boolean {
    return this._startDate <= other.endDate && other.startDate <= this._endDate;
  }

  lengthInDays(): number {
    const start = Date.parse(`${this._startDate}T00:00:00Z`);
    const end = Date.parse(`${this._endDate}T00:00:00Z`);
    return Math.round((end - start) / 86_400_000) + 1;
  }
}