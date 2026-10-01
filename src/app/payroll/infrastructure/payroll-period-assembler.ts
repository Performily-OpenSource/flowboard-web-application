import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {PayrollPeriodResource, PayrollPeriodsResponse} from './payroll-periods-response';

export class PayrollPeriodAssembler implements BaseAssembler<PayrollPeriod, PayrollPeriodResource, PayrollPeriodsResponse> {
  toEntityFromResource(resource: PayrollPeriodResource): PayrollPeriod { return new PayrollPeriod(resource); }
  toResourceFromEntity(entity: PayrollPeriod): PayrollPeriodResource {
    return {id: entity.id, periodYear: entity.periodYear, periodMonth: entity.periodMonth, scheduledPaymentDate: entity.scheduledPaymentDate};
  }
  toEntitiesFromResponse(response: PayrollPeriodsResponse): PayrollPeriod[] { return response.data.map(resource => this.toEntityFromResource(resource)); }
}
