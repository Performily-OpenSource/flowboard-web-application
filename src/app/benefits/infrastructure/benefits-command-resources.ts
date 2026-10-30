/**
 * Body of POST /benefit-types: creates a benefit type of the catalog (CreateBenefitTypeResource).
 *
 * @remarks The web service has no periodicity, so it is not sent.
 * @author Salym
 */
export interface CreateBenefitTypeResource {
  name: string;
  description: string | null;
  hasBalance: boolean;
  unit: string;
}

/**
 * Body of POST /benefits: assigns a benefit to one employee or to an area (AssignBenefitResource).
 *
 * @remarks Send employeeId or areaId, never both. With areaId the web service creates one assignment
 * per active employee of the area and skips who already has the benefit in the period.
 * @author Salym
 */
export interface AssignBenefitResource {
  benefitTypeId: number;
  employeeId: number | null;
  areaId: number | null;
  quantity: number;
  startDate: string;
  endDate: string;
}

/**
 * Body of POST /benefits/{id}/deliveries: registers the delivery of a benefit (RegisterDeliveryResource).
 *
 * @remarks Until IAM exists the HR employee that registers it is sent by the client.
 * @author Salym
 */
export interface RegisterDeliveryResource {
  deliveredOn: string;
  registeredById: number | null;
  notes: string | null;
}

/**
 * Operation of a manual adjustment: ADD adds days, DEDUCT discounts them.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export type AdjustmentOperation = 'ADD' | 'DEDUCT';

/**
 * Body of POST /vacation-balances/{employeeId}/adjustments: manual adjustment of a vacation balance
 * (AdjustVacationBalanceResource).
 *
 * @remarks The days are always positive; the operation gives the sign. Until IAM exists the author
 * is sent by the client.
 * @author Salym
 */
export interface AdjustVacationBalanceResource {
  operation: AdjustmentOperation;
  days: number;
  reason: string;
  authorId: number;
}
