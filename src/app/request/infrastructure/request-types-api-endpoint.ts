import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RequestType} from '../domain/model/request-type.entity';
import {RequestTypeResource, RequestTypesResponse} from './request-types-response';
import {RequestTypeAssembler} from './request-type-assembler';

/**
 * HTTP endpoint of the request types resource
 * (environment.platformProviderRequestTypesEndpointPath) of the Flowboard Web Service (environment.webServiceApiBaseUrl).
 *
 * @author Diego Alonso Diaz Villalba
 */
export class RequestTypesApiEndpoint extends BaseApiEndpoint<RequestType, RequestTypeResource, RequestTypesResponse, RequestTypeAssembler> {

  /**
   * Creates the endpoint with its URL and assembler.
   *
   * @param http - The Angular HTTP client.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(http: HttpClient) {
    super(http, `${environment.webServiceApiBaseUrl}${environment.platformProviderRequestTypesEndpointPath}`, new RequestTypeAssembler());
  }
}
