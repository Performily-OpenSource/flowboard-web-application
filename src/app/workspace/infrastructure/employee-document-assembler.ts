import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DocumentType, EmployeeDocument} from '../domain/model/employee-document.entity';
import {
  AttachEmployeeDocumentRequest,
  EmployeeDocumentResource,
  EmployeeDocumentsResponse
} from './employee-documents-response';

/**
 * Assembler that converts between EmployeeDocumentResource (API) and EmployeeDocument (domain entity).
 * The API nests documents under the employee, so the employee id is given by the caller.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeeDocumentAssembler implements BaseAssembler<EmployeeDocument, EmployeeDocumentResource, EmployeeDocumentsResponse> {

  /**
   * Converts a EmployeeDocumentResource into a EmployeeDocument entity.
   *
   * @param resource   - The resource returned by the API.
   * @param employeeId - The identifier of the employee that owns the document.
   * @returns The corresponding EmployeeDocument entity
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntityFromResource(resource: EmployeeDocumentResource, employeeId = 0): EmployeeDocument {
    return new EmployeeDocument({
      id: resource.id,
      employeeId,
      documentType: resource.documentType as DocumentType,
      fileName: resource.fileName,
      contentType: resource.contentType,
      sizeInBytes: resource.sizeInBytes,
      storageUrl: resource.storageUrl,
      uploadedAt: resource.uploadedAt
    });
  }

  /**
   * Converts a EmployeeDocument entity into a EmployeeDocumentResource.
   *
   * @param entity - The entity to convert.
   * @returns The corresponding EmployeeDocumentResource
   * @author Oscar Lizandro Vasquez Llave
   */
  toResourceFromEntity(entity: EmployeeDocument): EmployeeDocumentResource {
    return {
      id: entity.id,
      documentType: entity.documentType,
      fileName: entity.fileName,
      contentType: entity.contentType,
      sizeInBytes: entity.sizeInBytes,
      storageUrl: entity.storageUrl,
      uploadedAt: entity.uploadedAt
    } as EmployeeDocumentResource;
  }

  /**
   * Builds the payload of POST /employees/{id}/documents.
   *
   * @param entity - The document to attach.
   * @returns The AttachEmployeeDocumentRequest
   * @author Oscar Lizandro Vasquez Llave
   */
  toAttachRequestFromEntity(entity: EmployeeDocument): AttachEmployeeDocumentRequest {
    return {
      documentType: entity.documentType,
      fileName: entity.fileName,
      contentType: entity.contentType,
      sizeInBytes: entity.sizeInBytes,
      storageUrl: entity.storageUrl
    };
  }

  /**
   * Converts a EmployeeDocumentsResponse into a list of EmployeeDocument entities.
   *
   * @param response - The response whose 'employeeDocuments' array is converted.
   * @returns The list of EmployeeDocument entities
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntitiesFromResponse(response: EmployeeDocumentsResponse): EmployeeDocument[] {
    return response.employeeDocuments.map(resource => this.toEntityFromResource(resource));
  }
}
