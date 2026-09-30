import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitTypeResource, BenefitTypesResponse} from './benefit-types-response';
import {BenefitTypeAssembler} from './benefit-type-assembler';

export class BenefitTypesApiEndpoint
  extends BaseApiEndpoint<BenefitType, BenefitTypeResource, BenefitTypesResponse, BenefitTypeAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderBenefitTypesEndpointPath}`,
      new BenefitTypeAssembler());
  }
}
