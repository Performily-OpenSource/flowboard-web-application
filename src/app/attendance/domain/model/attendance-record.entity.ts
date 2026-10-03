import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Punch} from './punch.entity';
import {WorkSchedule} from './work-schedule.entity';

/**
 * Defines the attendance states supported by the Attendance bounded context.
 *
 * @remarks Restricts attendance records to the statuses used by attendance calculations and presentation.
 * @author Dario Avila de la cruz
 */
export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'JUSTIFIED' | 'INCOMPLETE';
/**
 * Defines the types of attendance punches.
 *
 * @remarks Distinguishes check-in events from check-out events.
 * @author Dario Avila de la cruz
 */
export type PunchType = 'CHECK_IN' | 'CHECK_OUT';

/**
 * Lists the attendance statuses supported by the Attendance bounded context.
 *
 * @remarks Provides the canonical status collection used by attendance filters and presentation logic.
 * @author Dario Avila de la cruz
 */
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['ON_TIME', 'LATE', 'ABSENT', 'JUSTIFIED', 'INCOMPLETE'];

/**
 * Represents an employee attendance record for a work date.
 *
 * @remarks Encapsulates punches, effective hours, overtime, attendance status and justification information used by the Attendance domain.
 * @author Dario Avila de la cruz
 */
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

/**
 * Performs the constructor operation.
 *
 * @param props the properties used to initialize the entity.
 * @author Dario Avila de la cruz
 */
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

/**
 * Builds an attendance record from the punches and work schedule for an employee and date.
 *
 * @param employeeId the employee identifier.
 * @param workDate the value used by the operation.
 * @param punches the value used by the operation.
 * @param schedule the value used by the operation.
 * @param id the identifier to look up or delete.
 * @returns The value produced by the `fromPunches` operation.
 * @author Dario Avila de la cruz
 */
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

/**
 * Performs the toMinutes operation.
 *
 * @param time the value used by the operation.
 * @returns The value produced by the `toMinutes` operation.
 * @author Dario Avila de la cruz
 */
  private static toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

/**
 * Determines whether both check-in and check-out times are present.
 *
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  isComplete(): boolean { return this.checkInTime !== null && this.checkOutTime !== null; }
/**
 * Determines whether the attendance record has incomplete status.
 *
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  isIncomplete(): boolean { return this.status === 'INCOMPLETE'; }
/**
 * Determines whether the attendance record has absent status.
 *
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  isAbsent(): boolean { return this.status === 'ABSENT'; }
/**
 * Determines whether the attendance record has justified status.
 *
 * @returns A boolean indicating the result of the operation.
 * @author Dario Avila de la cruz
 */
  isJustified(): boolean { return this.status === 'JUSTIFIED'; }
}
