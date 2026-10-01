export type PaymentStatus = 'PENDING' | 'PAID' | 'OBSERVED';

export class PaymentDetails {
  readonly status: PaymentStatus;
  readonly paidOn: string | null;
  readonly observationReason: string | null;

  private constructor(status: PaymentStatus, paidOn: string | null, observationReason: string | null) {
    this.status = status;
    this.paidOn = paidOn;
    this.observationReason = observationReason;
  }

  static pending(): PaymentDetails { return new PaymentDetails('PENDING', null, null); }

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
