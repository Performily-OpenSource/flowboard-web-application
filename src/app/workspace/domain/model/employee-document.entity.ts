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

export class EmployeeDocument {
  private _id: number;
  private _employeeId: number;
  private _documentType: DocumentType;
  private _fileName: string;
  private _contentType: string;
  private _sizeInBytes: number;
  private _storageUrl: string;
  private _uploadedAt: string;

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

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get employeeId(): number {
    return this._employeeId;
  }

  set employeeId(value: number) {
    this._employeeId = value;
  }

  get documentType(): DocumentType {
    return this._documentType;
  }

  set documentType(value: DocumentType) {
    this._documentType = value;
  }

  get fileName(): string {
    return this._fileName;
  }

  set fileName(value: string) {
    this._fileName = value;
  }

  get contentType(): string {
    return this._contentType;
  }

  set contentType(value: string) {
    this._contentType = value;
  }

  get sizeInBytes(): number {
    return this._sizeInBytes;
  }

  set sizeInBytes(value: number) {
    this._sizeInBytes = value;
  }

  get storageUrl(): string {
    return this._storageUrl;
  }

  set storageUrl(value: string) {
    this._storageUrl = value;
  }

  get uploadedAt(): string {
    return this._uploadedAt;
  }

  set uploadedAt(value: string) {
    this._uploadedAt = value;
  }

  isPdf(): boolean {
    return this._contentType === 'application/pdf';
  }
}
