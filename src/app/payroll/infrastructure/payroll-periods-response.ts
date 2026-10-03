import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';

/**
 * Represents a payroll period received from the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface PayrollPeriodResource extends BaseResource {
  periodYear: number;
  periodMonth: number;
  scheduledPaymentDate: string;
}

/**
 * API response containing payroll periods.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface PayrollPeriodsResponse extends BaseResponse {
  data: PayrollPeriodResource[];
}
