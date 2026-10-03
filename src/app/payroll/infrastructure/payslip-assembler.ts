import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {FileReference, Money, Payslip, PaymentDetails} from '../domain/model/payslip.entity';
import {PayslipResource, PayslipsResponse} from './payslips-response';

/**
 * Transforms infrastructure payslip resources into domain entities and vice versa.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayslipAssembler implements BaseAssembler<Payslip, PayslipResource, PayslipsResponse> {
/**
 * Converts an API resource into a domain entity.
 * @param resource Parameter used by the operation.
 * @author Diana Li
 */
  toEntityFromResource(resource: PayslipResource): Payslip {
    const payment = resource.paymentStatus === 'PAID'
      ? PaymentDetails.pending().paid(resource.paidOn ?? '')
      : resource.paymentStatus === 'OBSERVED'
        ? PaymentDetails.pending().observed(resource.observationReason ?? '')
        : PaymentDetails.pending();

    return new Payslip({
      id: resource.id,
      employeeId: resource.employeeId,
      payrollPeriodId: resource.payrollPeriodId,
      file: new FileReference({
        fileName: resource.fileName,
        contentType: resource.contentType,
        sizeInBytes: resource.sizeBytes,
        storageUrl: resource.storageUrl
      }),
      issueDate: resource.issueDate,
      netAmount: new Money(resource.netAmount, resource.netCurrency),
      publicationStatus: resource.publicationStatus,
      publishedAt: resource.publishedAt,
      payment
    });
  }

/**
 * Converts a domain entity into an API resource.
 * @param entity Parameter used by the operation.
 * @author Diana Li
 */
  toResourceFromEntity(entity: Payslip): PayslipResource {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      payrollPeriodId: entity.payrollPeriodId,
      fileName: entity.file.fileName,
      contentType: entity.file.contentType,
      sizeBytes: entity.file.sizeInBytes,
      storageUrl: entity.file.storageUrl,
      issueDate: entity.issueDate,
      netAmount: entity.netAmount.amount,
      netCurrency: entity.netAmount.currency,
      publicationStatus: entity.publicationStatus,
      publishedAt: entity.publishedAt,
      paymentStatus: entity.payment.status,
      paidOn: entity.payment.paidOn,
      observationReason: entity.payment.observationReason
    };
  }

/**
 * Converts an API response into a collection of entities.
 * @param response Parameter used by the operation.
 * @author Diana Li
 */
  toEntitiesFromResponse(response: PayslipsResponse): Payslip[] {
    return response.data.map(resource => this.toEntityFromResource(resource));
  }
}
