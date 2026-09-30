import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class WorkSchedule implements BaseEntity {
  private _id: number;
  private _positionId: number;
  private _shiftStartTime: string;
  private _shiftEndTime: string;
  private _lateToleranceMinutes: number;
  private _workingDays: number[];

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

  expectedHours(): number {
    const [startH, startM] = this.shiftStartTime.split(':').map(Number);
    const [endH, endM] = this.shiftEndTime.split(':').map(Number);
    return Math.max(0, ((endH * 60 + endM) - (startH * 60 + startM)) / 60 - 1);
  }

  isWorkingDay(date: string): boolean {
    const day = new Date(`${date}T00:00:00`).getDay();
    return this.workingDays.includes(day);
  }

  isLate(checkInTime: string): boolean {
    return checkInTime > this.shiftStartTime && checkInTime > this.timeWithTolerance();
  }

  private timeWithTolerance(): string {
    const [hour, minute] = this.shiftStartTime.split(':').map(Number);
    const total = hour * 60 + minute + this.lateToleranceMinutes;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}
