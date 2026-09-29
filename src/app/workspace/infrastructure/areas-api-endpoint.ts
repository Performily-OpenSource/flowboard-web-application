import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Area} from '../domain/model/area.entity';
import {AreaResource, AreasResponse} from './areas-response';
import {AreaAssembler} from './area-assembler';

export class AreasApiEndpoint extends BaseApiEndpoint<Area, AreaResource, AreasResponse, AreaAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderAreasEndpointPath}`, new AreaAssembler());
  }
}
