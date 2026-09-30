export type VacationMovementType = 'ACCRUAL' | 'USAGE' | 'REVERSAL' | 'MANUAL_ADJUSTMENT';

export const VACATION_MOVEMENT_TYPES: VacationMovementType[] = ['ACCRUAL', 'USAGE', 'REVERSAL', 'MANUAL_ADJUSTMENT'];

/** Entity inside VacationBalance: every change of the balance leaves one movement. */
export class VacationMovement {
  private _id: number;
  private _type: VacationMovementType;
  private _days: number;
  private _reason: string;
  private _authorId: number | null;
  private _requestId: number | null;
  private _occurredAt: string;

  constructor(props: {
    id: number;
    type: VacationMovementType;
    days: number;
    reason: string;
    authorId?: number | null;
    requestId?: number | null;
    occurredAt: string;
  }) {
    this._id = props.id;
    this._type = props.type;
    this._days = props.days;
    this._reason = props.reason;
    this._authorId = props.authorId ?? null;
    this._requestId = props.requestId ?? null;
    this._occurredAt = props.occurredAt;
  }

  get id(): number {
    return this._id;
  }

  get type(): VacationMovementType {
    return this._type;
  }

  /** Signed amount: positive adds available days, negative removes them. */
  get days(): number {
    return this._days;
  }

  get reason(): string {
    return this._reason;
  }

  get authorId(): number | null {
    return this._authorId;
  }

  get requestId(): number | null {
    return this._requestId;
  }

  get occurredAt(): string {
    return this._occurredAt;
  }
}
