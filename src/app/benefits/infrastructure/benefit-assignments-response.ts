import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Represents the delivery of an assignment received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitDeliveryResource {
  id: number;
  deliveredOn: string;
  registeredBy: number;
  notes: string;
}

/**
 * Represents a benefit assignment received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitAssignmentResource extends BaseResource {
  id: number;
  benefitTypeId: number;
  employeeId: number;
  sourceAreaId: number | null;
  validFrom: string;
  validTo: string;
  quantity: number;
  status: string;
  delivery: BenefitDeliveryResource | null;
}

/**
 * API response containing benefit assignments.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitAssignmentsResponse extends BaseResponse {
  benefitAssignments: BenefitAssignmentResource[];
}
