import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Payslip} from '../domain/model/payslip.entity';
import {PayslipAssembler} from './payslip-assembler';
import {PayslipResource, PayslipsResponse} from './payslips-response';

/**
 * Encapsulates HTTP endpoints related to payslips.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayslipsApiEndpoint extends BaseApiEndpoint<Payslip, PayslipResource, PayslipsResponse, PayslipAssembler> {
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
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPayslipsEndpointPath}`, new PayslipAssembler());
  }
}
