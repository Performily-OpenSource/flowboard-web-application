import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {FileReference} from './file-reference.vo';
import {Money} from './Money';
import {PaymentDetails, PaymentStatus} from './payment-details.vo';

export {FileReference, Money, PaymentDetails};
export type {PaymentStatus};
/**
 * Defines the PublicationStatus structure used by the context.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export type PublicationStatus = 'UNDER_REVIEW' | 'PUBLISHED';

/**
 * Represents a payslip within the payroll context.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
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

/**
 * Publishes the payslip and records its publication date.
 * @param publishedAt Parameter used by the operation.
 * @author Diana Li
 */
  publish(publishedAt = new Date().toISOString()): void {
    this.publicationStatus = 'PUBLISHED';
    this.publishedAt = publishedAt;
  }

/**
 * Replaces the payslip file and data, returning it to the review state.
 * @param file Parameter used by the operation.
 * @param issueDate Parameter used by the operation.
 * @param netAmount Parameter used by the operation.
 * @author Diana Li
 */
  replaceFile(file: FileReference, issueDate: string, netAmount: Money): void {
    this.file = file;
    this.issueDate = issueDate;
    this.netAmount = netAmount;
    this.publicationStatus = 'UNDER_REVIEW';
    this.publishedAt = null;
    this.payment = PaymentDetails.pending();
  }

/**
 * Marks the payslip as paid with the specified date.
 * @param paidOn Parameter used by the operation.
 * @author Diana Li
 */
  markAsPaid(paidOn: string): void { this.payment = this.payment.paid(paidOn); }
/**
 * Records an observation about the payslip payment.
 * @param reason Parameter used by the operation.
 * @author Diana Li
 */
  markAsObserved(reason: string): void { this.payment = this.payment.observed(reason); }
/**
 * Determines whether the published payslip is visible to the specified employee.
 * @param employeeId Parameter used by the operation.
 * @author Diana Li
 */
  isVisibleTo(employeeId: number): boolean { return this.publicationStatus === 'PUBLISHED' && this.employeeId === employeeId; }
}
