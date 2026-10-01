import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {FileReference} from './file-reference.vo';
import {Money} from './Money';
import {PaymentDetails, PaymentStatus} from './payment-details.vo';

export {FileReference, Money, PaymentDetails};
export type {PaymentStatus};
export type PublicationStatus = 'UNDER_REVIEW' | 'PUBLISHED';

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

  markAsPaid(paidOn: string): void { this.payment = this.payment.paid(paidOn); }
  markAsObserved(reason: string): void { this.payment = this.payment.observed(reason); }
  isVisibleTo(employeeId: number): boolean { return this.publicationStatus === 'PUBLISHED' && this.employeeId === employeeId; }
}
