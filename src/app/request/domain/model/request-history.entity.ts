import {RequestStatus} from './request.entity';

export class RequestHistory {
  private _id: number;
  private _previousStatus: RequestStatus | null;
  private _newStatus: RequestStatus;
  private _actorId: number;
  private _comment: string | null;
  private _occurredAt: string;

  constructor(props: {
    id: number;
    previousStatus: RequestStatus | null;
    newStatus: RequestStatus;
    actorId: number;
    comment?: string | null;
    occurredAt: string;
  }) {
    this._id = props.id;
    this._previousStatus = props.previousStatus;
    this._newStatus = props.newStatus;
    this._actorId = props.actorId;
    this._comment = props.comment ?? null;
    this._occurredAt = props.occurredAt;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get previousStatus(): RequestStatus | null {
    return this._previousStatus;
  }

  set previousStatus(value: RequestStatus | null) {
    this._previousStatus = value;
  }

  get newStatus(): RequestStatus {
    return this._newStatus;
  }

  set newStatus(value: RequestStatus) {
    this._newStatus = value;
  }

  get actorId(): number {
    return this._actorId;
  }

  set actorId(value: number) {
    this._actorId = value;
  }

  get comment(): string | null {
    return this._comment;
  }

  set comment(value: string | null) {
    this._comment = value;
  }

  get occurredAt(): string {
    return this._occurredAt;
  }

  set occurredAt(value: string) {
    this._occurredAt = value;
  }
}
