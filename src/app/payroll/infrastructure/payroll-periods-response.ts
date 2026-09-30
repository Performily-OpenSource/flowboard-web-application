import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';

export interface PayrollPeriodResource extends BaseResource {
  year: number;
  month: number;
  scheduledPaymentDate: string;
}

export interface PayrollPeriodsResponse extends BaseResponse {
  data: PayrollPeriodResource[];
}
