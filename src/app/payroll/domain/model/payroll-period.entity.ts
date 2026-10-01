import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class PayrollPeriod implements BaseEntity {
  id: number;
  periodYear: number;
  periodMonth: number;
  scheduledPaymentDate: string;

  constructor(props: { id: number; periodYear: number; periodMonth: number; scheduledPaymentDate: string }) {
    this.id = props.id;
    this.periodYear = props.periodYear;
    this.periodMonth = props.periodMonth;
    this.scheduledPaymentDate = props.scheduledPaymentDate;
  }

  label(): string {
    return new Intl.DateTimeFormat('es-PE', {month: 'long', year: 'numeric'})
      .format(new Date(this.periodYear, this.periodMonth - 1, 1))
      .replace(/^./, value => value.toUpperCase());
  }
}
