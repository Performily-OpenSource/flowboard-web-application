import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {PayrollPeriodAssembler} from './payroll-period-assembler';
import {PayrollPeriodResource, PayrollPeriodsResponse} from './payroll-periods-response';

export class PayrollPeriodsApiEndpoint extends BaseApiEndpoint<PayrollPeriod, PayrollPeriodResource, PayrollPeriodsResponse, PayrollPeriodAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPayrollPeriodsEndpointPath}`, new PayrollPeriodAssembler());
  }
}
