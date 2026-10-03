/**
 * Defines the PaymentStatus structure used by the context.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export type PaymentStatus = 'PENDING' | 'PAID' | 'OBSERVED';

/**
 * Encapsulates the status and information associated with a payslip payment.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PaymentDetails {
  readonly status: PaymentStatus;
  readonly paidOn: string | null;
  readonly observationReason: string | null;

/**
 * Initializes the instance with the data required for operation.
 * @param status Parameter used by the operation.
 * @param paidOn Parameter used by the operation.
 * @param observationReason Parameter used by the operation.
 * @author Diana Li
 */
  private constructor(status: PaymentStatus, paidOn: string | null, observationReason: string | null) {
    this.status = status;
    this.paidOn = paidOn;
    this.observationReason = observationReason;
  }

/**
 * Creates a pending payment status.
 * @author Diana Li
 */
  static pending(): PaymentDetails { return new PaymentDetails('PENDING', null, null); }

/**
 * Creates a paid payment status with its date.
 * @param paidOn Parameter used by the operation.
 * @author Diana Li
 */
  paid(paidOn: string): PaymentDetails {
    if (!paidOn) throw new Error('The payment date is required.');
    return new PaymentDetails('PAID', paidOn, null);
  }

/**
 * Creates an observed payment status with the specified reason.
 * @param reason Parameter used by the operation.
 * @author Diana Li
 */
  observed(reason: string): PaymentDetails {
    const normalized = reason.trim();
    if (!normalized) throw new Error('The observation reason is required.');
    if (normalized.length > 500) throw new Error('The observation reason cannot exceed 500 characters.');
    return new PaymentDetails('OBSERVED', null, normalized);
  }
}
