import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Punch} from '../domain/model/punch.entity';
import {PunchResource, PunchesResponse} from './punches-response';
import {PunchAssembler} from './punch-assembler';

/**
 * Provides the HTTP endpoint configuration for attendance punches.
 *
 * @remarks Binds the generic API endpoint infrastructure to punch resources and the configured platform URL.
 * @author Dario Avila de la cruz
 */
export class PunchesApiEndpoint extends BaseApiEndpoint<Punch, PunchResource, PunchesResponse, PunchAssembler> {
/**
 * Performs the constructor operation.
 *
 * @param http the HTTP client dependency.
 * @author Dario Avila de la cruz
 */
  constructor(http: HttpClient) { super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPunchesEndpointPath}`, new PunchAssembler()); }
}
