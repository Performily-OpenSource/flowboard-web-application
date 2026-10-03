import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * Represents the work schedule used to evaluate attendance.
 *
 * @remarks Provides shift times, working days and late-tolerance rules used to calculate expected hours and attendance status.
 * @author Dario Avila de la cruz
 */
export class WorkSchedule implements BaseEntity {
  private _id: number;
  private _positionId: number;
  private _shiftStartTime: string;
  private _shiftEndTime: string;
  private _lateToleranceMinutes: number;
  private _workingDays: number[];

/**
 * Performs the constructor operation.
 * 
 * @param props the properties used to initialize the entity.
 * @author Dario Avila de la cruz
 */
  constructor(props: {
    id: number;
    positionId: number;
    shiftStartTime: string;
    shiftEndTime: string;
    lateToleranceMinutes: number;
    workingDays: number[];
  }) {
    this._id = props.id;
    this._positionId = props.positionId;
    this._shiftStartTime = props.shiftStartTime;
    this._shiftEndTime = props.shiftEndTime;
    this._lateToleranceMinutes = props.lateToleranceMinutes;
    this._workingDays = props.workingDays;
  }


  get id(): number { return this._id; }

  get positionId(): number { return this._positionId; }

  get shiftStartTime(): string { return this._shiftStartTime; }

  get shiftEndTime(): string { return this._shiftEndTime; }

  get lateToleranceMinutes(): number { return this._lateToleranceMinutes; }

  get workingDays(): number[] { return this._workingDays; }

/**
 * Calculates the expected hours for an employee during the selected period.
 *
 * @returns The expected number of working hours for the requested period.
 * @author Dario Avila de la cruz
 */
  expectedHours(): number {
    const [startH, startM] = this.shiftStartTime.split(':').map(Number);
    const [endH, endM] = this.shiftEndTime.split(':').map(Number);
    return Math.max(0, ((endH * 60 + endM) - (startH * 60 + startM)) / 60 - 1);
  }

/**
 * Determines whether a date is a scheduled working day.
 *
 * @param date the date to evaluate.
 * @returns A boolean indicating whether the supplied value satisfies the schedule rule.
 * @author Dario Avila de la cruz
 */
  isWorkingDay(date: string): boolean {
    const day = new Date(`${date}T00:00:00`).getDay();
    return this.workingDays.includes(day);
  }

/**
 * Determines whether a check-in time exceeds the configured late tolerance.
 *
 * @param checkInTime the check-in time to evaluate.
 * @returns A boolean indicating whether the supplied value satisfies the schedule rule.
 * @author Dario Avila de la cruz
 */
  isLate(checkInTime: string): boolean {
    return checkInTime > this.shiftStartTime && checkInTime > this.timeWithTolerance();
  }

/**
 * Performs the timeWithTolerance operation.
 *
 * @returns The value produced by the `timeWithTolerance` operation.
 * @author Dario Avila de la cruz
 */
  private timeWithTolerance(): string {
    const [hour, minute] = this.shiftStartTime.split(':').map(Number);
    const total = hour * 60 + minute + this.lateToleranceMinutes;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}
