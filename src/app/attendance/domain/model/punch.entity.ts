import {BaseEntity} from '../../../shared/domain/model/base-entity';
import type {PunchType} from './attendance-record.entity';

/**
 * Represents a single attendance punch registered for an employee.
 *
 * @remarks Associates a check-in or check-out event with an attendance record and its timestamp.
 * @author Dario Avila de la cruz
 */
export class Punch implements BaseEntity {
  private _id: number;
  private _employeeId: number;
  private _attendanceRecordId: number;
  private _punchedAt: string;
  private _type: PunchType;

/**
 * Performs the constructor operation.
 *
 * @param props the properties used to initialize the entity.
 * @author Dario Avila de la cruz
 */
  constructor(props: { id: number; employeeId: number; attendanceRecordId: number; punchedAt: string; type: PunchType }) {
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._attendanceRecordId = props.attendanceRecordId;
    this._punchedAt = props.punchedAt;
    this._type = props.type;
  }

  get id(): number { return this._id; }

  set id(value: number) { this._id = value; }

  get employeeId(): number { return this._employeeId; }

  set employeeId(value: number) { this._employeeId = value; }

  get attendanceRecordId(): number { return this._attendanceRecordId; }

  set attendanceRecordId(value: number) { this._attendanceRecordId = value; }

  get punchedAt(): string { return this._punchedAt; }

  set punchedAt(value: string) { this._punchedAt = value; }

  get type(): PunchType { return this._type; }

  set type(value: PunchType) { this._type = value; }
}
