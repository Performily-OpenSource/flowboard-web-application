import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of an employee document returned by the API. */
export interface EmployeeDocumentResource extends BaseResource {
  id: number;
  /** Identifier of the employee who owns the document. */
  employeeId: number;
  /** Document type code (see DocumentType). */
  documentType: string;
  fileName: string;
  /** MIME type of the file. */
  contentType: string;
  sizeInBytes: number;
  /** URL where the file content is stored. */
  storageUrl: string;
  /** Upload date-time as an ISO string. */
  uploadedAt: string;
}

/** Response wrapper returned by the API when the documents are listed inside an 'employeeDocuments' property. */
export interface EmployeeDocumentsResponse extends BaseResponse {
  employeeDocuments: EmployeeDocumentResource[];
}
