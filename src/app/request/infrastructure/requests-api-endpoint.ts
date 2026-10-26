import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Request} from '../domain/model/request.entity';
import {RequestResource, RequestsResponse} from './requests-response';
import {RequestAssembler} from './request-assembler';

/**
 * HTTP endpoint of the requests resource
 * (environment.platformProviderRequestsEndpointPath) of the Flowboard Web Service (environment.webServiceApiBaseUrl).
 *
 * @author Diego Alonso Diaz Villalba
 */
export class RequestsApiEndpoint extends BaseApiEndpoint<Request, RequestResource, RequestsResponse, RequestAssembler> {

  /**
   * Creates the endpoint with its URL and assembler.
   *
   * @param http - The Angular HTTP client.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(http: HttpClient) {
    super(http, `${environment.webServiceApiBaseUrl}${environment.platformProviderRequestsEndpointPath}`, new RequestAssembler());
  }
}
