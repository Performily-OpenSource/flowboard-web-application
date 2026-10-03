/**
 * Represents the file reference associated with a payslip payment.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class FileReference {
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeInBytes: number;
  readonly storageUrl: string;

/**
 * Initializes the instance with the data required for operation.
 * @param props Parameter used by the operation.
 * @author Diana Li
 */
  constructor(props: { fileName: string; contentType: string; sizeInBytes: number; storageUrl: string }) {
    if (props.contentType !== 'application/pdf') throw new Error('Payslips must be PDF files.');
    this.fileName = props.fileName;
    this.contentType = props.contentType;
    this.sizeInBytes = props.sizeInBytes;
    this.storageUrl = props.storageUrl;
  }
}
