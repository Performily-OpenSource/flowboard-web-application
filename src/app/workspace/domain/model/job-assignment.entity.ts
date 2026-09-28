import {Area} from './area.entity';
import {Position} from './position.entity';

export type AssignmentChangeType = 'HIRE' | 'REASSIGNMENT' | 'REINSTATEMENT';

export const ASSIGNMENT_CHANGE_TYPES: AssignmentChangeType[] = ['HIRE', 'REASSIGNMENT', 'REINSTATEMENT'];

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

  get areaId(): number {
    return this._areaId;
  }

  set areaId(value: number) {
    this._areaId = value;
  }

  get positionId(): number {
    return this._positionId;
  }

  set positionId(value: number) {
    this._positionId = value;
  }

  get changeType(): AssignmentChangeType {
    return this._changeType;
  }

  set changeType(value: AssignmentChangeType) {
    this._changeType = value;
  }

  get startDate(): string {
    return this._startDate;
  }

  set startDate(value: string) {
    this._startDate = value;
  }

  get endDate(): string | null {
    return this._endDate;
  }

  set endDate(value: string | null) {
    this._endDate = value;
  }

  get area(): Area | null {
    return this._area;
  }

  set area(value: Area | null) {
    this._area = value;
  }

  get position(): Position | null {
    return this._position;
  }

  set position(value: Position | null) {
    this._position = value;
  }

  isCurrent(): boolean {
    return this._endDate === null;
  }
}
