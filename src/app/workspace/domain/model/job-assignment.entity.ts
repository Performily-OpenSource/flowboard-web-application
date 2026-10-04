import {Area} from './area.entity';
import {Position} from './position.entity';

/** Reason that originated a job assignment: initial hire, reassignment or reinstatement. */
export type AssignmentChangeType = 'HIRE' | 'REASSIGNMENT' | 'REINSTATEMENT';

/** All supported assignment change types, e.g. for select options. */
export const ASSIGNMENT_CHANGE_TYPES: AssignmentChangeType[] = ['HIRE', 'REASSIGNMENT', 'REINSTATEMENT'];

/**
 * Entity representing a period in which an employee held a position in an area.
 * Together, an employee's assignments form their job history; an assignment without end date is the current one.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class JobAssignment {
  private _id: number;
  private _employeeId: number;
  private _areaId: number;
  private _positionId: number;
  private _changeType: AssignmentChangeType;
  private _startDate: string;
  private _endDate: string | null;
  private _area: Area | null;
  private _position: Position | null;

  /**
   * Creates a new JobAssignment.
   * Optional fields (endDate, area, position) default to null.
   *
   * @param props - The assignment data: id, employeeId, areaId, positionId, change type, start date and optional end date.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(props: {
    id: number;
    employeeId: number;
    areaId: number;
    positionId: number;
    changeType: AssignmentChangeType;
    startDate: string;
    endDate?: string | null;
    area?: Area | null;
    position?: Position | null;
  }) {
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._areaId = props.areaId;
    this._positionId = props.positionId;
    this._changeType = props.changeType;
    this._startDate = props.startDate;
    this._endDate = props.endDate ?? null;
    this._area = props.area ?? null;
    this._position = props.position ?? null;
  }

  /** Unique identifier of the job assignment. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Identifier of the employee this assignment belongs to. */
  get employeeId(): number {
    return this._employeeId;
  }

  set employeeId(value: number) {
    this._employeeId = value;
  }

  /** Identifier of the assigned area. */
  get areaId(): number {
    return this._areaId;
  }

  set areaId(value: number) {
    this._areaId = value;
  }

  /** Identifier of the assigned position. */
  get positionId(): number {
    return this._positionId;
  }

  set positionId(value: number) {
    this._positionId = value;
  }

  /** Reason that originated this assignment. */
  get changeType(): AssignmentChangeType {
    return this._changeType;
  }

  set changeType(value: AssignmentChangeType) {
    this._changeType = value;
  }

  /** Start date as a 'YYYY-MM-DD' string. */
  get startDate(): string {
    return this._startDate;
  }

  set startDate(value: string) {
    this._startDate = value;
  }

  /** End date as a 'YYYY-MM-DD' string, or null while the assignment is current. */
  get endDate(): string | null {
    return this._endDate;
  }

  set endDate(value: string | null) {
    this._endDate = value;
  }

  /** Resolved assigned area, or null if not loaded. */
  get area(): Area | null {
    return this._area;
  }

  set area(value: Area | null) {
    this._area = value;
  }

  /** Resolved assigned position, or null if not loaded. */
  get position(): Position | null {
    return this._position;
  }

  set position(value: Position | null) {
    this._position = value;
  }

  /**
   * Checks whether this is the employee's current assignment.
   *
   * @returns True if the assignment has no end date, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  isCurrent(): boolean {
    return this._endDate === null;
  }
}
