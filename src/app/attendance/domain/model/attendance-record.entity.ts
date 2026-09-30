import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Punch} from './punch.entity';
import {WorkSchedule} from './work-schedule.entity';

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'JUSTIFIED' | 'INCOMPLETE';
export type PunchType = 'CHECK_IN' | 'CHECK_OUT';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['ON_TIME', 'LATE', 'ABSENT', 'JUSTIFIED', 'INCOMPLETE'];

export class AttendanceRecord implements BaseEntity {
  private _id: number;
  private _employeeId: number;
  private _workDate: string;
  private _checkInTime: string | null;
  private _checkOutTime: string | null;
  private _effectiveHours: number | null;
  private _overtimeHours: number | null;
  private _status: AttendanceStatus;
  private _justificationReason: string | null;
  private _justificationDocumentName: string | null;

  constructor(props: {
    id: number;
    employeeId: number;
    workDate: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    effectiveHours?: number | null;
    overtimeHours?: number | null;
    status: AttendanceStatus;
    justificationReason?: string | null;
    justificationDocumentName?: string | null;
  }) {
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._workDate = props.workDate;
    this._checkInTime = props.checkInTime ?? null;
    this._checkOutTime = props.checkOutTime ?? null;
    this._effectiveHours = props.effectiveHours ?? null;
    this._overtimeHours = props.overtimeHours ?? null;
    this._status = props.status;
    this._justificationReason = props.justificationReason ?? null;
    this._justificationDocumentName = props.justificationDocumentName ?? null;
  }

  get id(): number { return this._id; }
  set id(value: number) { this._id = value; }
  get employeeId(): number { return this._employeeId; }
  set employeeId(value: number) { this._employeeId = value; }
  get workDate(): string { return this._workDate; }
  set workDate(value: string) { this._workDate = value; }
  get checkInTime(): string | null { return this._checkInTime; }
  set checkInTime(value: string | null) { this._checkInTime = value; }
  get checkOutTime(): string | null { return this._checkOutTime; }
  set checkOutTime(value: string | null) { this._checkOutTime = value; }
  get effectiveHours(): number | null { return this._effectiveHours; }
  set effectiveHours(value: number | null) { this._effectiveHours = value; }
  get overtimeHours(): number | null { return this._overtimeHours; }
  set overtimeHours(value: number | null) { this._overtimeHours = value; }
  get status(): AttendanceStatus { return this._status; }
  set status(value: AttendanceStatus) { this._status = value; }
  get justificationReason(): string | null { return this._justificationReason; }
  set justificationReason(value: string | null) { this._justificationReason = value; }
  get justificationDocumentName(): string | null { return this._justificationDocumentName; }
  set justificationDocumentName(value: string | null) { this._justificationDocumentName = value; }


  static fromPunches(employeeId: number, workDate: string, punches: Punch[], schedule: WorkSchedule, id = 0): AttendanceRecord {
    const dayPunches = punches.filter(p => p.employeeId === employeeId && p.punchedAt.startsWith(workDate)).sort((a, b) => a.punchedAt.localeCompare(b.punchedAt));
    const checkIn = dayPunches.find(p => p.type === 'CHECK_IN');
    const checkOut = [...dayPunches].reverse().find(p => p.type === 'CHECK_OUT');
    if (!checkIn) {
      return new AttendanceRecord({ id, employeeId, workDate, status: 'ABSENT' });
    }
    const checkInTime = checkIn.punchedAt.slice(11, 16);
    if (!checkOut) {
      return new AttendanceRecord({ id, employeeId, workDate, checkInTime, status: 'INCOMPLETE' });
    }
    const checkOutTime = checkOut.punchedAt.slice(11, 16);
    const start = AttendanceRecord.toMinutes(checkInTime);
    const end = AttendanceRecord.toMinutes(checkOutTime);
    const effectiveHours = Math.max(0, (end - start) / 60 - 1);
    const overtimeHours = Math.max(0, effectiveHours - schedule.expectedHours());
    const status: AttendanceStatus = schedule.isLate(checkInTime) ? 'LATE' : 'ON_TIME';
    return new AttendanceRecord({ id, employeeId, workDate, checkInTime, checkOutTime, effectiveHours, overtimeHours, status });
  }

  private static toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  isComplete(): boolean { return this.checkInTime !== null && this.checkOutTime !== null; }
  isIncomplete(): boolean { return this.status === 'INCOMPLETE'; }
  isAbsent(): boolean { return this.status === 'ABSENT'; }
  isJustified(): boolean { return this.status === 'JUSTIFIED'; }
}
