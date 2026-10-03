import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {PayrollPeriodResource, PayrollPeriodsResponse} from './payroll-periods-response';

/**
 * Transforms infrastructure payroll period resources into domain entities and vice versa.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollPeriodAssembler implements BaseAssembler<PayrollPeriod, PayrollPeriodResource, PayrollPeriodsResponse> {
/**
 * Converts an API resource into a domain entity.
 * @param resource Parameter used by the operation.
 * @author Diana Li
 */
  toEntityFromResource(resource: PayrollPeriodResource): PayrollPeriod { return new PayrollPeriod(resource); }
/**
 * Converts a domain entity into an API resource.
 * @param entity Parameter used by the operation.
 * @author Diana Li
 */
  toResourceFromEntity(entity: PayrollPeriod): PayrollPeriodResource {
    return {id: entity.id, periodYear: entity.periodYear, periodMonth: entity.periodMonth, scheduledPaymentDate: entity.scheduledPaymentDate};
  }
/**
 * Converts an API response into a collection of entities.
 * @param response Parameter used by the operation.
 * @author Diana Li
 */
  toEntitiesFromResponse(response: PayrollPeriodsResponse): PayrollPeriod[] { return response.data.map(resource => this.toEntityFromResource(resource)); }
}
