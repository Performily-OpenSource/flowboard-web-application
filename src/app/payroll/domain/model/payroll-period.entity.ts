import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class PayrollPeriod implements BaseEntity {
    id: number;
    year: number;
    month: number;
    scheduledPaymentDate: string;

    constructor(props: { id: number; year: number; month: number; scheduledPaymentDate: string }) {
        this.id = props.id;
        this.year = props.year;
        this.month = props.month;
        this.scheduledPaymentDate = props.scheduledPaymentDate;
    }

  label(): string {
    return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' })
      .format(new Date(this.year, this.month - 1, 1))
      .replace(/^./, value => value.toUpperCase());
  }
}
