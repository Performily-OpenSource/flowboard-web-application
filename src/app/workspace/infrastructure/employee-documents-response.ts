import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface EmployeeDocumentResource extends BaseResource {
  id: number;
  employeeId: number;
  documentType: string;
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  storageUrl: string;
  uploadedAt: string;
}

export interface EmployeeDocumentsResponse extends BaseResponse {
  employeeDocuments: EmployeeDocumentResource[];
}
