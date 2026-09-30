import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationBalanceResource, VacationBalancesResponse} from './vacation-balances-response';
import {VacationBalanceAssembler} from './vacation-balance-assembler';

export class VacationBalancesApiEndpoint extends BaseApiEndpoint<VacationBalance, VacationBalanceResource,
  VacationBalancesResponse, VacationBalanceAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderVacationBalancesEndpointPath}`,
      new VacationBalanceAssembler());
  }
}
