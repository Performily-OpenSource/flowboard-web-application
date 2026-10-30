import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Represents a benefit type received from the web service (BenefitTypeResource).
 *
 * @remarks The web service does not have the periodicity yet, so it is optional: when it is missing
 * the assembler leaves it as null.
 * @author Salym
 */
export interface BenefitTypeResource extends BaseResource {
  id: number;
  name: string;
  description: string | null;
  hasBalance: boolean;
  unit: string;
  periodicity?: string | null;
  active: boolean;
}

/**
 * API response containing benefit types.
 *
 * @remarks The web service answers with a plain array; this wrapper is kept for the BaseAssembler
 * contract.
 * @author Salym
 */
export interface BenefitTypesResponse extends BaseResponse {
  benefitTypes: BenefitTypeResource[];
}
