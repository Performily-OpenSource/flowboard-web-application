import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DocumentType, EmployeeDocument} from '../domain/model/employee-document.entity';
import {EmployeeDocumentResource, EmployeeDocumentsResponse} from './employee-documents-response';

/**
 * Assembler that converts between EmployeeDocumentResource (API) and EmployeeDocument (domain entity).
 * The document type is cast to DocumentType.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeeDocumentAssembler implements BaseAssembler<EmployeeDocument, EmployeeDocumentResource, EmployeeDocumentsResponse> {

  /**
   * Converts a EmployeeDocumentResource into a EmployeeDocument entity.
   *
   * @param resource - The resource returned by the API.
   * @returns The corresponding EmployeeDocument entity
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Converts a EmployeeDocument entity into a EmployeeDocumentResource to be sent to the API.
   *
   * @param entity - The entity to convert.
   * @returns The corresponding EmployeeDocumentResource
   * @author Oscar Lizandro Vasquez Llave
   */
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
