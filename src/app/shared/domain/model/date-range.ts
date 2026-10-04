/**
 * Shared Kernel value object: a closed range of calendar dates (ISO yyyy-MM-dd).
 * Rules: startDate and endDate are required and endDate cannot be before startDate.
 */
export class DateRange {
  private readonly _startDate: string;
  private readonly _endDate: string;

  /**
   * Creates a date range.
   *
   * @param startDate - First day of the range (yyyy-MM-dd).
   * @param endDate   - Last day of the range (yyyy-MM-dd).
   * @throws Error when a date is missing or endDate is before startDate.
   */
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

  /**
   * Checks whether two dates form a valid range without creating it.
   *
   * @param startDate - First day of the range.
   * @param endDate   - Last day of the range.
   * @returns True when both dates exist and endDate is not before startDate.
   */
  static isValid(startDate: string | null | undefined, endDate: string | null | undefined): boolean {
    return !!startDate && !!endDate && endDate >= startDate;
  }

  /** First day of the range. */
  get startDate(): string {
    return this._startDate;
  }

  /** Last day of the range. */
  get endDate(): string {
    return this._endDate;
  }

  /**
   * Checks whether a date is inside the range (both ends included).
   *
   * @param date - Date to check (yyyy-MM-dd or ISO date-time).
   * @returns True when the date is inside the range.
   */
  contains(date: string): boolean {
    const day = date.substring(0, 10);
    return day >= this._startDate && day <= this._endDate;
  }

  /**
   * Checks whether this range shares at least one day with another range.
   *
   * @param other - The other range.
   * @returns True when both ranges overlap.
   */
  overlaps(other: DateRange): boolean {
    return this._startDate <= other.endDate && other.startDate <= this._endDate;
  }

  /**
   * Counts the calendar days of the range, both ends included.
   *
   * @returns Number of days.
   */
  lengthInDays(): number {
    const start = Date.parse(`${this._startDate}T00:00:00Z`);
    const end = Date.parse(`${this._endDate}T00:00:00Z`);
    return Math.round((end - start) / 86_400_000) + 1;
  }
}