import {RequestType} from './request-type.entity';
import {RequestHistory} from './request-history.entity';

/** Status of a request through its life cycle. */
export type RequestStatus = 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
/** Who must resolve a request: the requester's direct manager or Human Resources. */
export type ApproverType = 'DIRECT_MANAGER' | 'HR_STAFF';

/** All supported request statuses, e.g. for filters. */
export const REQUEST_STATUSES: RequestStatus[] = ['IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'];

/**
 * Value entered by the employee for one field of the request type.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestFieldValue {
  /** Key of the field the value belongs to. */
  key: string;
  /** Value entered, as text. */
  value: string;
}

/**
 * File attached to a request.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestAttachment {
  /** Original name of the file. */
  fileName: string;
  /** MIME type of the file, e.g. 'application/pdf'. */
  contentType: string;
  /** Size of the file in bytes. */
  sizeInBytes: number;
  /** Location where the file is stored. */
  storageUrl: string;
}

/**
 * Counts the working days (Monday to Friday) between two dates, both included.
 *
 * @param startDate - First day, in 'yyyy-MM-dd' format.
 * @param endDate - Last day, in 'yyyy-MM-dd' format.
 * @returns The number of working days
 * @author Diego Alonso Diaz Villalba
 */
export function countWorkingDays(startDate: string, endDate: string): number {
  const toDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };
  const current = toDate(startDate);
  const end = toDate(endDate);
  let days = 0;
  while (current <= end) {
    const weekDay = current.getUTCDay();
    if (weekDay !== 0 && weekDay !== 6) days++;
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
}

/**
 * Counts the hours between two times of the same day, rounded to 2 decimals.
 *
 * @param startTime - Start time, in 'HH:mm' format.
 * @param endTime - End time, in 'HH:mm' format.
 * @returns The number of hours
 * @author Diego Alonso Diaz Villalba
 */
export function countHours(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return Math.round(((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60 * 100) / 100;
}

/**
 * Aggregate root of the Request bounded context representing a request submitted by an employee
 * (US29 to US33), such as vacations, permissions or justifications.
 * Holds the period, the field values, the attachments, the approver, the status and the history of status changes.
 *
 * @author Diego Alonso Diaz Villalba
 */
export class Request {
  private _id: number;
  private _requesterId: number;
  private _requestTypeId: number;
  private _startDate: string | null;
  private _endDate: string | null;
  private _startTime: string | null;
  private _endTime: string | null;
  private _fieldValues: RequestFieldValue[];
  private _attachments: RequestAttachment[];
  private _approverType: ApproverType;
  private _approverId: number | null;
  private _status: RequestStatus;
  private _submittedAt: string;
  private _history: RequestHistory[];
  private _requestType: RequestType | null;

  /**
   * Creates a new Request.
   * Optional fields (period, field values, attachments, approverId, history and requestType) default to null or an empty list.
   *
   * @param props - The request data: identifiers, period, values, attachments, approver, status, submission date and history.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(props: {
    id: number;
    requesterId: number;
    requestTypeId: number;
    startDate?: string | null;
    endDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    fieldValues?: RequestFieldValue[];
    attachments?: RequestAttachment[];
    approverType: ApproverType;
    approverId?: number | null;
    status: RequestStatus;
    submittedAt: string;
    history?: RequestHistory[];
    requestType?: RequestType | null;
  }) {
    this._id = props.id;
    this._requesterId = props.requesterId;
    this._requestTypeId = props.requestTypeId;
    this._startDate = props.startDate ?? null;
    this._endDate = props.endDate ?? null;
    this._startTime = props.startTime ?? null;
    this._endTime = props.endTime ?? null;
    this._fieldValues = props.fieldValues ?? [];
    this._attachments = props.attachments ?? [];
    this._approverType = props.approverType;
    this._approverId = props.approverId ?? null;
    this._status = props.status;
    this._submittedAt = props.submittedAt;
    this._history = props.history ?? [];
    this._requestType = props.requestType ?? null;
  }

  /** Unique identifier of the request. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Identifier of the employee who submitted the request (Workspace). */
  get requesterId(): number {
    return this._requesterId;
  }

  set requesterId(value: number) {
    this._requesterId = value;
  }

  /** Identifier of the request type. */
  get requestTypeId(): number {
    return this._requestTypeId;
  }

  set requestTypeId(value: number) {
    this._requestTypeId = value;
  }

  /** First day of the period, or null when the type has no period. */
  get startDate(): string | null {
    return this._startDate;
  }

  set startDate(value: string | null) {
    this._startDate = value;
  }

  /** Last day of the period, or null. */
  get endDate(): string | null {
    return this._endDate;
  }

  set endDate(value: string | null) {
    this._endDate = value;
  }

  /** Start time for requests measured in hours, or null. */
  get startTime(): string | null {
    return this._startTime;
  }

  set startTime(value: string | null) {
    this._startTime = value;
  }

  /** End time for requests measured in hours, or null. */
  get endTime(): string | null {
    return this._endTime;
  }

  set endTime(value: string | null) {
    this._endTime = value;
  }

  /** Values entered for the fields of the request type. */
  get fieldValues(): RequestFieldValue[] {
    return this._fieldValues;
  }

  set fieldValues(value: RequestFieldValue[]) {
    this._fieldValues = value;
  }

  /** Files attached to the request. */
  get attachments(): RequestAttachment[] {
    return this._attachments;
  }

  set attachments(value: RequestAttachment[]) {
    this._attachments = value;
  }

  /** Who must resolve the request. */
  get approverType(): ApproverType {
    return this._approverType;
  }

  set approverType(value: ApproverType) {
    this._approverType = value;
  }

  /** Identifier of the direct manager who resolves it, or null when it goes to Human Resources. */
  get approverId(): number | null {
    return this._approverId;
  }

  set approverId(value: number | null) {
    this._approverId = value;
  }

  /** Current status of the request. */
  get status(): RequestStatus {
    return this._status;
  }

  set status(value: RequestStatus) {
    this._status = value;
  }

  /** Date and time when the request was submitted, in ISO format. */
  get submittedAt(): string {
    return this._submittedAt;
  }

  set submittedAt(value: string) {
    this._submittedAt = value;
  }

  /** Status changes of the request, oldest first. */
  get history(): RequestHistory[] {
    return [...this._history].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  set history(value: RequestHistory[]) {
    this._history = value;
  }

  /** The request type, linked by the store after loading, or null. */
  get requestType(): RequestType | null {
    return this._requestType;
  }

  set requestType(value: RequestType | null) {
    this._requestType = value;
  }

  /** Code shown to the user, e.g. 'SOL-0012'. */
  get code(): string {
    return `SOL-${String(this._id).padStart(4, '0')}`;
  }

  /**
   * Checks whether the request has a period.
   *
   * @returns True if it has a start date, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  hasPeriod(): boolean {
    return this._startDate !== null;
  }

  /**
   * Checks whether the request is measured in hours.
   *
   * @returns True if it has a start and an end time, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  hasTimes(): boolean {
    return this._startTime !== null && this._endTime !== null;
  }

  /**
   * Checks whether the period covers a single day.
   *
   * @returns True if it has a start date and no end date or the same end date, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isSingleDay(): boolean {
    return this._startDate !== null && (this._endDate === null || this._endDate === this._startDate);
  }

  /**
   * Counts the working days requested.
   *
   * @returns The working days of the period, or 0 when there is no period or it is measured in hours
   * @author Diego Alonso Diaz Villalba
   */
  requestedDays(): number {
    if (!this._startDate || this.hasTimes()) return 0;
    return countWorkingDays(this._startDate, this._endDate ?? this._startDate);
  }

  /**
   * Counts the hours requested.
   *
   * @returns The hours between the start and end time, or 0 when it is not measured in hours
   * @author Diego Alonso Diaz Villalba
   */
  requestedHours(): number {
    return this._startTime && this._endTime ? countHours(this._startTime, this._endTime) : 0;
  }

  /**
   * Gets the value entered for a field.
   *
   * @param key - The field key.
   * @returns The value, or null if the field has no value
   * @author Diego Alonso Diaz Villalba
   */
  fieldValue(key: string): string | null {
    return this._fieldValues.find(value => value.key === key)?.value ?? null;
  }

  /**
   * Checks whether the request is waiting to be resolved.
   *
   * @returns True if the status is 'IN_PROGRESS', false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isPending(): boolean {
    return this._status === 'IN_PROGRESS';
  }

  /**
   * Checks whether the request was returned to the employee to complete it.
   *
   * @returns True if the status is 'UNDER_REVIEW', false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isUnderReview(): boolean {
    return this._status === 'UNDER_REVIEW';
  }

  /**
   * Checks whether the request is already resolved (approved, rejected or cancelled).
   *
   * @returns True if it is neither pending nor under review, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isResolved(): boolean {
    return !this.isPending() && !this.isUnderReview();
  }

  /**
   * Checks whether the employee can still cancel the request (US33).
   *
   * @returns True if it is pending or under review, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  canBeCancelled(): boolean {
    return this.isPending() || this.isUnderReview();
  }

  /**
   * Checks whether the request was submitted by an employee.
   *
   * @param employeeId - The employee identifier.
   * @returns True if the employee is the requester, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isOwnedBy(employeeId: number): boolean {
    return this._requesterId === employeeId;
  }

  /**
   * Checks whether the request must be resolved by Human Resources.
   *
   * @returns True if the approver type is 'HR_STAFF', false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isRoutedToHr(): boolean {
    return this._approverType === 'HR_STAFF';
  }

  /** Comment of the last time the request was returned for review, or null. */
  get reviewComment(): string | null {
    return [...this.history].reverse().find(entry => entry.newStatus === 'UNDER_REVIEW')?.comment ?? null;
  }

  /** Reason given when the request was rejected, or null. */
  get rejectionReason(): string | null {
    return this.history.find(entry => entry.newStatus === 'REJECTED')?.comment ?? null;
  }

  /** Date of the last status change, or the submission date when there is none. */
  get lastUpdatedAt(): string {
    const history = this.history;
    return history.length > 0 ? history[history.length - 1].occurredAt : this._submittedAt;
  }

  /**
   * Counts the hours since the request was submitted.
   *
   * @param now - The reference date; defaults to the current date.
   * @returns The hours waited, with decimals
   * @author Diego Alonso Diaz Villalba
   */
  waitingHours(now: Date = new Date()): number {
    return (now.getTime() - new Date(this._submittedAt).getTime()) / 3_600_000;
  }
}
