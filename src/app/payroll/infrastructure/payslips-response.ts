import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';
import {PaymentStatus, PublicationStatus} from '../domain/model/payslip.entity';

/**
 * Represents a payslip received from or sent to the API.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface PayslipResource extends BaseResource {
  employeeId: number;
  payrollPeriodId: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageUrl: string;
  issueDate: string;
  netAmount: number;
  netCurrency: string;
  publicationStatus: PublicationStatus;
  publishedAt: string | null;
  paymentStatus: PaymentStatus;
  paidOn: string | null;
  observationReason: string | null;
}

/**
 * API response containing payslips.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface PayslipsResponse extends BaseResponse {
  data: PayslipResource[];
}
