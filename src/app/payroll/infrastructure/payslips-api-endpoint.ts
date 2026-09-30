import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Payslip} from '../domain/model/payslip.entity';
import {PayslipAssembler} from './payslip-assembler';
import {PayslipResource, PayslipsResponse} from './payslips-response';

export class PayslipsApiEndpoint extends BaseApiEndpoint<Payslip, PayslipResource, PayslipsResponse, PayslipAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPayslipsEndpointPath}`, new PayslipAssembler());
  }
}
