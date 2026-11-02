import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of an employee document returned by the API (EmployeeDocumentResponse). */
export interface EmployeeDocumentResource extends BaseResource {
  id: number;
  documentType: string;
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  storageUrl: string;
  /** Upload date and time, ISO 8601 without time zone. */
  uploadedAt: string;
}

/** Payload of POST /employees/{id}/documents (AttachEmployeeDocumentRequest). */
export interface AttachEmployeeDocumentRequest {
  documentType: string;
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  storageUrl: string;
}

/** Response wrapper kept for the BaseAssembler contract; the API returns a plain array. */
export interface EmployeeDocumentsResponse extends BaseResponse {
  employeeDocuments: EmployeeDocumentResource[];
}
