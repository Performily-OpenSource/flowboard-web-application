import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Represents a benefit type received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitTypeResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  hasBalance: boolean;
  unit: string;
  periodicity: string;
  active: boolean;
}

/**
 * API response containing benefit types.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitTypesResponse extends BaseResponse {
  benefitTypes: BenefitTypeResource[];
}
