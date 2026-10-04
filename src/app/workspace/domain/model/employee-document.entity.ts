/** Category of a document stored in an employee's file. */
export type DocumentType =
  | 'IDENTITY_DOCUMENT'
  | 'EMPLOYMENT_CONTRACT'
  | 'CONTRACT_ADDENDUM'
  | 'PENSION_AFFILIATION'
  | 'HEALTH_INSURANCE'
  | 'EDUCATION_CERTIFICATE'
  | 'CRIMINAL_RECORD_CERTIFICATE'
  | 'WARNING_LETTER'
  | 'COMMENDATION_LETTER';

/** All supported employee document types, e.g. for select options. */
export const DOCUMENT_TYPES: DocumentType[] = [
  'IDENTITY_DOCUMENT',
  'EMPLOYMENT_CONTRACT',
  'CONTRACT_ADDENDUM',
  'PENSION_AFFILIATION',
  'HEALTH_INSURANCE',
  'EDUCATION_CERTIFICATE',
  'CRIMINAL_RECORD_CERTIFICATE',
  'WARNING_LETTER',
  'COMMENDATION_LETTER'
];

/**
 * Entity representing a file attached to an employee's record (contract, certificate, letter, etc.).
 * Stores file metadata and the URL where the file content is stored.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeeDocument {
  private _id: number;
  private _employeeId: number;
  private _documentType: DocumentType;
  private _fileName: string;
  private _contentType: string;
  private _sizeInBytes: number;
  private _storageUrl: string;
  private _uploadedAt: string;

  /**
   * Creates a new EmployeeDocument.
   *
   * @param props - The document data: id, owning employeeId, document type, file name, MIME content type,
   *                size in bytes, storage URL and upload timestamp.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(props: {
    id: number;
    employeeId: number;
    documentType: DocumentType;
    fileName: string;
    contentType: string;
    sizeInBytes: number;
    storageUrl: string;
    uploadedAt: string;
  }) {
    this._id = props.id;
    this._employeeId = props.employeeId;
    this._documentType = props.documentType;
    this._fileName = props.fileName;
    this._contentType = props.contentType;
    this._sizeInBytes = props.sizeInBytes;
    this._storageUrl = props.storageUrl;
    this._uploadedAt = props.uploadedAt;
  }

  /** Unique identifier of the document. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Identifier of the employee who owns the document. */
  get employeeId(): number {
    return this._employeeId;
  }

  set employeeId(value: number) {
    this._employeeId = value;
  }

  /** Category of the document. */
  get documentType(): DocumentType {
    return this._documentType;
  }

  set documentType(value: DocumentType) {
    this._documentType = value;
  }

  /** Original file name. */
  get fileName(): string {
    return this._fileName;
  }

  set fileName(value: string) {
    this._fileName = value;
  }

  /** MIME type of the file (e.g. 'application/pdf'). */
  get contentType(): string {
    return this._contentType;
  }

  set contentType(value: string) {
    this._contentType = value;
  }

  /** File size in bytes. */
  get sizeInBytes(): number {
    return this._sizeInBytes;
  }

  set sizeInBytes(value: number) {
    this._sizeInBytes = value;
  }

  /** URL where the file content is stored. */
  get storageUrl(): string {
    return this._storageUrl;
  }

  set storageUrl(value: string) {
    this._storageUrl = value;
  }

  /** Upload date-time as an ISO string. */
  get uploadedAt(): string {
    return this._uploadedAt;
  }

  set uploadedAt(value: string) {
    this._uploadedAt = value;
  }

  /**
   * Checks whether the document is a PDF file.
   *
   * @returns True if the content type is 'application/pdf', false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  isPdf(): boolean {
    return this._contentType === 'application/pdf';
  }
}
