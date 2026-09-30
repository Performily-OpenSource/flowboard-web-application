import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Request} from '../domain/model/request.entity';
import {RequestResource, RequestsResponse} from './requests-response';
import {RequestAssembler} from './request-assembler';

export class RequestsApiEndpoint extends BaseApiEndpoint<Request, RequestResource, RequestsResponse, RequestAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRequestsEndpointPath}`, new RequestAssembler());
  }
}
