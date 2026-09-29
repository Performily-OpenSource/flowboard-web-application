import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Position} from '../domain/model/position.entity';
import {PositionResource, PositionsResponse} from './positions-response';
import {PositionAssembler} from './position-assembler';

export class PositionsApiEndpoint extends BaseApiEndpoint<Position, PositionResource, PositionsResponse, PositionAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPositionsEndpointPath}`, new PositionAssembler());
  }
}
