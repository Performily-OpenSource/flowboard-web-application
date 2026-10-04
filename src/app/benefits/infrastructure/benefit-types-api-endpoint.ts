import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitTypeResource, BenefitTypesResponse} from './benefit-types-response';
import {BenefitTypeAssembler} from './benefit-type-assembler';

/**
 * Encapsulates HTTP endpoints related to benefit types.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitTypesApiEndpoint
  extends BaseApiEndpoint<BenefitType, BenefitTypeResource, BenefitTypesResponse, BenefitTypeAssembler> {

  /**
   * Initializes the endpoint with the benefit types URL of the environment.
   * @param http Angular HTTP client used to call the API.
   * @author Salym
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderBenefitTypesEndpointPath}`,
      new BenefitTypeAssembler());
  }
}
