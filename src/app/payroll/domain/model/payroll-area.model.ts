/**
 * Represents an organizational area used to classify payroll employees.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollArea {
  constructor(
    readonly id: number,
    readonly name: string
  ) {}
}
