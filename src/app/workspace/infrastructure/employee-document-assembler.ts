import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DocumentType, EmployeeDocument} from '../domain/model/employee-document.entity';
import {EmployeeDocumentResource, EmployeeDocumentsResponse} from './employee-documents-response';

export class EmployeeDocumentAssembler implements BaseAssembler<EmployeeDocument, EmployeeDocumentResource, EmployeeDocumentsResponse> {

  toEntityFromResource(resource: EmployeeDocumentResource): EmployeeDocument {
    return new EmployeeDocument({
      id: resource.id,
      employeeId: resource.employeeId,
      documentType: resource.documentType as DocumentType,
      fileName: resource.fileName,
      contentType: resource.contentType,
      sizeInBytes: resource.sizeInBytes,
      storageUrl: resource.storageUrl,
      uploadedAt: resource.uploadedAt
    });
  }

  toResourceFromEntity(entity: EmployeeDocument): EmployeeDocumentResource {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      documentType: entity.documentType,
      fileName: entity.fileName,
      contentType: entity.contentType,
      sizeInBytes: entity.sizeInBytes,
      storageUrl: entity.storageUrl,
      uploadedAt: entity.uploadedAt
    } as EmployeeDocumentResource;
  }

  toEntitiesFromResponse(response: EmployeeDocumentsResponse): EmployeeDocument[] {
    return response.employeeDocuments.map(resource => this.toEntityFromResource(resource));
  }
}
