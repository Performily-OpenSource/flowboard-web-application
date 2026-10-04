import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Position} from '../domain/model/position.entity';
import {PositionResource, PositionsResponse} from './positions-response';
import {PositionAssembler} from './position-assembler';

/**
 * API endpoint for the Position resource, targeting the '/positions' REST collection
 * (platformProviderApiBaseUrl + /positions). Inherits CRUD operations from BaseApiEndpoint.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class PositionsApiEndpoint extends BaseApiEndpoint<Position, PositionResource, PositionsResponse, PositionAssembler> {

  /**
   * Creates the endpoint with the /positions URL and a PositionAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPositionsEndpointPath}`, new PositionAssembler());
  }
}
