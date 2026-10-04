import {RequestStatus} from './request.entity';

/**
 * Entry of the history of a request: one status change, who made it and when (US31).
 *
 * @remarks The first entry of every request has no previous status.
 * @author Diego Alonso Diaz Villalba
 */
export class RequestHistory {
  private _id: number;
  private _previousStatus: RequestStatus | null;
  private _newStatus: RequestStatus;
  private _actorId: number;
  private _comment: string | null;
  private _occurredAt: string;

  /**
   * Creates a new RequestHistory entry.
   * The comment defaults to null.
   *
   * @param props - The entry data: identifier, previous and new status, actor, optional comment and date.
   * @author Diego Alonso Diaz Villalba
   */
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

  /** Identifier of the entry within its request. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Status before the change, or null for the first entry. */
  get previousStatus(): RequestStatus | null {
    return this._previousStatus;
  }

  set previousStatus(value: RequestStatus | null) {
    this._previousStatus = value;
  }

  /** Status after the change. */
  get newStatus(): RequestStatus {
    return this._newStatus;
  }

  set newStatus(value: RequestStatus) {
    this._newStatus = value;
  }

  /** Identifier of the employee who made the change. */
  get actorId(): number {
    return this._actorId;
  }

  set actorId(value: number) {
    this._actorId = value;
  }

  /** Comment or reason given with the change, or null. */
  get comment(): string | null {
    return this._comment;
  }

  set comment(value: string | null) {
    this._comment = value;
  }

  /** Date and time of the change in ISO format. */
  get occurredAt(): string {
    return this._occurredAt;
  }

  set occurredAt(value: string) {
    this._occurredAt = value;
  }
}
