import {RequestType} from './request-type.entity';
import {RequestHistory} from './request-history.entity';

export type RequestStatus = 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApproverType = 'DIRECT_MANAGER' | 'HR_STAFF';

export const REQUEST_STATUSES: RequestStatus[] = ['IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'];

export interface RequestFieldValue {
  key: string;
  value: string;
}

export interface RequestAttachment {
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  storageUrl: string;
}

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

export function countHours(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return Math.round(((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60 * 100) / 100;
}

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

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get requesterId(): number {
    return this._requesterId;
  }

  set requesterId(value: number) {
    this._requesterId = value;
  }

  get requestTypeId(): number {
    return this._requestTypeId;
  }

  set requestTypeId(value: number) {
    this._requestTypeId = value;
  }

  get startDate(): string | null {
    return this._startDate;
  }

  set startDate(value: string | null) {
    this._startDate = value;
  }

  get endDate(): string | null {
    return this._endDate;
  }

  set endDate(value: string | null) {
    this._endDate = value;
  }

  get startTime(): string | null {
    return this._startTime;
  }

  set startTime(value: string | null) {
    this._startTime = value;
  }

  get endTime(): string | null {
    return this._endTime;
  }

  set endTime(value: string | null) {
    this._endTime = value;
  }

  get fieldValues(): RequestFieldValue[] {
    return this._fieldValues;
  }

  set fieldValues(value: RequestFieldValue[]) {
    this._fieldValues = value;
  }

  get attachments(): RequestAttachment[] {
    return this._attachments;
  }

  set attachments(value: RequestAttachment[]) {
    this._attachments = value;
  }

  get approverType(): ApproverType {
    return this._approverType;
  }

  set approverType(value: ApproverType) {
    this._approverType = value;
  }

  get approverId(): number | null {
    return this._approverId;
  }

  set approverId(value: number | null) {
    this._approverId = value;
  }

  get status(): RequestStatus {
    return this._status;
  }

  set status(value: RequestStatus) {
    this._status = value;
  }

  get submittedAt(): string {
    return this._submittedAt;
  }

  set submittedAt(value: string) {
    this._submittedAt = value;
  }

  get history(): RequestHistory[] {
    return [...this._history].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  set history(value: RequestHistory[]) {
    this._history = value;
  }

  get requestType(): RequestType | null {
    return this._requestType;
  }

  set requestType(value: RequestType | null) {
    this._requestType = value;
  }

  get code(): string {
    return `SOL-${String(this._id).padStart(4, '0')}`;
  }

  hasPeriod(): boolean {
    return this._startDate !== null;
  }

  hasTimes(): boolean {
    return this._startTime !== null && this._endTime !== null;
  }

  isSingleDay(): boolean {
    return this._startDate !== null && (this._endDate === null || this._endDate === this._startDate);
  }

  requestedDays(): number {
    if (!this._startDate || this.hasTimes()) return 0;
    return countWorkingDays(this._startDate, this._endDate ?? this._startDate);
  }

  requestedHours(): number {
    return this._startTime && this._endTime ? countHours(this._startTime, this._endTime) : 0;
  }

  fieldValue(key: string): string | null {
    return this._fieldValues.find(value => value.key === key)?.value ?? null;
  }

  isPending(): boolean {
    return this._status === 'IN_PROGRESS';
  }

  isUnderReview(): boolean {
    return this._status === 'UNDER_REVIEW';
  }

  isResolved(): boolean {
    return !this.isPending() && !this.isUnderReview();
  }

  canBeCancelled(): boolean {
    return this.isPending() || this.isUnderReview();
  }

  isOwnedBy(employeeId: number): boolean {
    return this._requesterId === employeeId;
  }

  isRoutedToHr(): boolean {
    return this._approverType === 'HR_STAFF';
  }

  get reviewComment(): string | null {
    return [...this.history].reverse().find(entry => entry.newStatus === 'UNDER_REVIEW')?.comment ?? null;
  }

  get rejectionReason(): string | null {
    return this.history.find(entry => entry.newStatus === 'REJECTED')?.comment ?? null;
  }

  get lastUpdatedAt(): string {
    const history = this.history;
    return history.length > 0 ? history[history.length - 1].occurredAt : this._submittedAt;
  }

  waitingHours(now: Date = new Date()): number {
    return (now.getTime() - new Date(this._submittedAt).getTime()) / 3_600_000;
  }
}
