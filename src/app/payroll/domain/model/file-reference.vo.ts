export class FileReference {
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeInBytes: number;
  readonly storageUrl: string;

  constructor(props: { fileName: string; contentType: string; sizeInBytes: number; storageUrl: string }) {
    if (props.contentType !== 'application/pdf') throw new Error('Payslips must be PDF files.');
    this.fileName = props.fileName;
    this.contentType = props.contentType;
    this.sizeInBytes = props.sizeInBytes;
    this.storageUrl = props.storageUrl;
  }
}
