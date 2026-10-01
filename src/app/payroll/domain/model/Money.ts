export class Money {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency = 'PEN') {
    if (amount < 0) throw new Error('The net amount cannot be negative.');
    this.amount = amount;
    this.currency = currency;
  }
}
