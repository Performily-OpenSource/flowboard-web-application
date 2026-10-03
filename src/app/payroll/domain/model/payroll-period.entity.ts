import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * Represents a payroll period and its scheduled payment date.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollPeriod implements BaseEntity {
  id: number;
  periodYear: number;
  periodMonth: number;
  scheduledPaymentDate: string;

/**
 * Initializes the instance with the data required for operation.
 * @param props Parameter used by the operation.
 * @author Diana Li
 */
  constructor(props: { id: number; periodYear: number; periodMonth: number; scheduledPaymentDate: string }) {
    this.id = props.id;
    this.periodYear = props.periodYear;
    this.periodMonth = props.periodMonth;
    this.scheduledPaymentDate = props.scheduledPaymentDate;
  }

/**
 * Returns a readable label for the period.
 * @author Diana Li
 */
  label(): string {
    return new Intl.DateTimeFormat('es-PE', {month: 'long', year: 'numeric'})
      .format(new Date(this.periodYear, this.periodMonth - 1, 1))
      .replace(/^./, value => value.toUpperCase());
  }
}
