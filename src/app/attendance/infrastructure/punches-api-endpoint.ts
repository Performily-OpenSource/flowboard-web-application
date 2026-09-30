import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Punch} from '../domain/model/punch.entity';
import {PunchResource, PunchesResponse} from './punches-response';
import {PunchAssembler} from './punch-assembler';

export class PunchesApiEndpoint extends BaseApiEndpoint<Punch, PunchResource, PunchesResponse, PunchAssembler> {
  constructor(http: HttpClient) { super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPunchesEndpointPath}`, new PunchAssembler()); }
}
