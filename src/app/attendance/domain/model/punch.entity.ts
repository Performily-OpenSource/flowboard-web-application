import {BaseEntity} from '../../../shared/domain/model/base-entity';
import type {PunchType} from './attendance-record.entity';

export class Punch implements BaseEntity {
  private _id: number;
  private _employeeId: number;
  private _punchedAt: string;
  private _type: PunchType;

  constructor(props: { id: number; employeeId: number; punchedAt: string; type: PunchType }) {
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._punchedAt = props.punchedAt;
    this._type = props.type;
  }

  get id(): number { return this._id; }
  set id(value: number) { this._id = value; }
  get employeeId(): number { return this._employeeId; }
  set employeeId(value: number) { this._employeeId = value; }
  get punchedAt(): string { return this._punchedAt; }
  set punchedAt(value: string) { this._punchedAt = value; }
  get type(): PunchType { return this._type; }
  set type(value: PunchType) { this._type = value; }
}
