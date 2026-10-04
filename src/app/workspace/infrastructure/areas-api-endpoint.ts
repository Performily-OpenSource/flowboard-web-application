import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Area} from '../domain/model/area.entity';
import {AreaResource, AreasResponse} from './areas-response';
import {AreaAssembler} from './area-assembler';

/**
 * API endpoint for the Area resource, targeting the '/areas' REST collection
 * (platformProviderApiBaseUrl + /areas). Inherits CRUD operations from BaseApiEndpoint.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class AreasApiEndpoint extends BaseApiEndpoint<Area, AreaResource, AreasResponse, AreaAssembler> {

  /**
   * Creates the endpoint with the /areas URL and an AreaAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderAreasEndpointPath}`, new AreaAssembler());
  }
}
