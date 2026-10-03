/**
 * Represents a monetary amount used by the payroll context.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class Money {
  readonly amount: number;
  readonly currency: string;

/**
 * Initializes the instance with the data required for operation.
 * @param amount Parameter used by the operation.
 * @param currency Parameter used by the operation.
 * @author Diana Li
 */
  constructor(amount: number, currency = 'PEN') {
    if (amount < 0) throw new Error('The net amount cannot be negative.');
    this.amount = amount;
    this.currency = currency;
  }
}
