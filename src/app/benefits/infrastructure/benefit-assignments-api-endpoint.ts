import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {BenefitAssignmentResource, BenefitAssignmentsResponse} from './benefit-assignments-response';
import {BenefitAssignmentAssembler} from './benefit-assignment-assembler';

/**
 * Encapsulates HTTP endpoints related to benefit assignments.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitAssignmentsApiEndpoint extends BaseApiEndpoint<BenefitAssignment, BenefitAssignmentResource,
  BenefitAssignmentsResponse, BenefitAssignmentAssembler> {

  /**
   * Initializes the endpoint with the benefit assignments URL of the environment.
   * @param http Angular HTTP client used to call the API.
   * @author Salym
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderBenefitAssignmentsEndpointPath}`,
      new BenefitAssignmentAssembler());
  }
}
