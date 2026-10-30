import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Represents the delivery of an assignment received from the web service (BenefitDeliveryResource).
 *
 * @remarks The delivery has no id of its own in the web service; it belongs to its assignment.
 * @author Salym
 */
export interface BenefitDeliveryResource {
  deliveredOn: string;
  registeredById: number | null;
  notes: string | null;
}

/**
 * Represents a benefit assignment received from the web service (BenefitAssignmentResource).
 *
 * @remarks employeeName is only filled in the lists; the answers of the actions send it as null.
 * @author Salym
 */
export interface BenefitAssignmentResource extends BaseResource {
  id: number;
  benefitTypeId: number;
  benefitTypeName: string;
  unit: string;
  employeeId: number;
  employeeName: string | null;
  sourceAreaId: number | null;
  quantity: number;
  displayQuantity: string;
  startDate: string;
  endDate: string;
  status: string;
  delivery: BenefitDeliveryResource | null;
}

/**
 * Result of POST /benefits (BenefitAssignmentBatchResource): one item for an employee, one per
 * employee for an area.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitAssignmentBatchResource {
  areaId: number | null;
  assignedCount: number;
  skippedCount: number;
  skippedEmployeeIds: number[];
  assignments: BenefitAssignmentResource[];
}

/**
 * Result of GET /benefits/area-preview (AreaAssignmentPreviewResource): what an assignment to an area
 * would do before confirming it.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface AreaAssignmentPreviewResource {
  areaId: number;
  activeEmployees: number;
  alreadyAssigned: number;
  toAssign: number;
}

/**
 * API response containing benefit assignments.
 *
 * @remarks The web service answers with a plain array; this wrapper is kept for the BaseAssembler
 * contract.
 * @author Salym
 */
export interface BenefitAssignmentsResponse extends BaseResponse {
  benefitAssignments: BenefitAssignmentResource[];
}
