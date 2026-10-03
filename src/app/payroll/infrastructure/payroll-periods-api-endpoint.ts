import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {PayrollPeriodAssembler} from './payroll-period-assembler';
import {PayrollPeriodResource, PayrollPeriodsResponse} from './payroll-periods-response';

/**
 * Encapsulates HTTP endpoints related to payroll periods.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollPeriodsApiEndpoint extends BaseApiEndpoint<PayrollPeriod, PayrollPeriodResource, PayrollPeriodsResponse, PayrollPeriodAssembler> {
/**
 * Initializes the instance with the data required for operation.
 * @param http Parameter used by the operation.
 * @author Diana Li
 */
  constructor(http: HttpClient) {
/**
 * Executes the super operation of the component.
 * @param http Parameter used by the operation.
 * @param new Parameter used by the operation.
 * @author Diana Li
 */
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPayrollPeriodsEndpointPath}`, new PayrollPeriodAssembler());
  }
}
