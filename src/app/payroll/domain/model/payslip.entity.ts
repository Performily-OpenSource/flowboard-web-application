import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type PublicationStatus = 'UNDER_REVIEW' | 'PUBLISHED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OBSERVED';

export class Money {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency = 'PEN') {
    if (amount < 0) throw new Error('The net amount cannot be negative.');
    this.amount = amount;
    this.currency = currency;
  }
}

export class FileReference {
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeInBytes: number;
  readonly storageUrl: string;

  constructor(props: { fileName: string; contentType: string; sizeInBytes: number; storageUrl: string }) {
    if (props.contentType !== 'application/pdf') throw new Error('Payslips must be PDF files.');
    this.fileName = props.fileName;
    this.contentType = props.contentType;
    this.sizeInBytes = props.sizeInBytes;
    this.storageUrl = props.storageUrl;
  }
}

export class PaymentDetails {
  readonly status: PaymentStatus;
  readonly paidOn: string | null;
  readonly observationReason: string | null;

  private constructor(status: PaymentStatus, paidOn: string | null, observationReason: string | null) {
    this.status = status;
    this.paidOn = paidOn;
    this.observationReason = observationReason;
  }

  static pending(): PaymentDetails {
    return new PaymentDetails('PENDING', null, null);
  }

  paid(paidOn: string): PaymentDetails {
    if (!paidOn) throw new Error('The payment date is required.');
    return new PaymentDetails('PAID', paidOn, null);
  }

  observed(reason: string): PaymentDetails {
    const normalized = reason.trim();
    if (!normalized) throw new Error('The observation reason is required.');
    if (normalized.length > 500) throw new Error('The observation reason cannot exceed 500 characters.');
    return new PaymentDetails('OBSERVED', null, normalized);
  }
}

export class Payslip implements BaseEntity {
  id: number;
  employeeId: number;
  payrollPeriodId: number;
  file: FileReference;
  issueDate: string;
  netAmount: Money;
  publicationStatus: PublicationStatus;
  publishedAt: string | null;
  payment: PaymentDetails;

  constructor(props: {
    id: number;
    employeeId: number;
    payrollPeriodId: number;
    file: FileReference;
    issueDate: string;
    netAmount: Money;
    publicationStatus?: PublicationStatus;
    publishedAt?: string | null;
    payment?: PaymentDetails;
  }) {
    this.id = props.id;
    this.employeeId = props.employeeId;
    this.payrollPeriodId = props.payrollPeriodId;
    this.file = props.file;
    this.issueDate = props.issueDate;
    this.netAmount = props.netAmount;
    this.publicationStatus = props.publicationStatus ?? 'UNDER_REVIEW';
    this.publishedAt = props.publishedAt ?? null;
    this.payment = props.payment ?? PaymentDetails.pending();
  }

  publish(publishedAt = new Date().toISOString()): void {
    this.publicationStatus = 'PUBLISHED';
    this.publishedAt = publishedAt;
  }

  replaceFile(file: FileReference, issueDate: string, netAmount: Money): void {
    this.file = file;
    this.issueDate = issueDate;
    this.netAmount = netAmount;
    this.publicationStatus = 'UNDER_REVIEW';
    this.publishedAt = null;
    this.payment = PaymentDetails.pending();
  }

  markAsPaid(paidOn: string): void {
    this.payment = this.payment.paid(paidOn);
  }

  markAsObserved(reason: string): void {
    this.payment = this.payment.observed(reason);
  }

  isVisibleTo(employeeId: number): boolean {
    return this.publicationStatus === 'PUBLISHED' && this.employeeId === employeeId;
  }
}
