import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface BenefitTypeResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  hasBalance: boolean;
  unit: string;
  periodicity: string;
  active: boolean;
}

export interface BenefitTypesResponse extends BaseResponse {
  benefitTypes: BenefitTypeResource[];
}
