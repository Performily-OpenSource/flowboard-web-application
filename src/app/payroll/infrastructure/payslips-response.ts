import {BaseResponse, BaseResource} from '../../shared/infrastructure/base-response';
import {PaymentStatus, PublicationStatus} from '../domain/model/payslip.entity';

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

export interface PayslipsResponse extends BaseResponse {
  data: PayslipResource[];
}
