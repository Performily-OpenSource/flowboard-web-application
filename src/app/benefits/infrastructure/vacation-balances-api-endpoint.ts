import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationBalanceResource, VacationBalancesResponse} from './vacation-balances-response';
import {VacationBalanceAssembler} from './vacation-balance-assembler';

/**
 * Encapsulates HTTP endpoints related to vacation balances.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class VacationBalancesApiEndpoint extends BaseApiEndpoint<VacationBalance, VacationBalanceResource,
  VacationBalancesResponse, VacationBalanceAssembler> {

  /**
   * Initializes the endpoint with the vacation balances URL of the environment.
   * @param http Angular HTTP client used to call the API.
   * @author Salym
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderVacationBalancesEndpointPath}`,
      new VacationBalanceAssembler());
  }
}
