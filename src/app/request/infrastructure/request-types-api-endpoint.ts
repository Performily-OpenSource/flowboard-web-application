import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RequestType} from '../domain/model/request-type.entity';
import {RequestTypeResource, RequestTypesResponse} from './request-types-response';
import {RequestTypeAssembler} from './request-type-assembler';

export class RequestTypesApiEndpoint extends BaseApiEndpoint<RequestType, RequestTypeResource, RequestTypesResponse, RequestTypeAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRequestTypesEndpointPath}`, new RequestTypeAssembler());
  }
}
