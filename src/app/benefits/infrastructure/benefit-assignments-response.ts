import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface BenefitDeliveryResource {
  id: number;
  deliveredOn: string;
  registeredBy: number;
  notes: string;
}

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

export interface BenefitAssignmentsResponse extends BaseResponse {
  benefitAssignments: BenefitAssignmentResource[];
}
