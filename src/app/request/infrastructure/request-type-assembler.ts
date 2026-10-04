import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {BalanceDeduction, RequestType} from '../domain/model/request-type.entity';
import {FieldDataType, RequestField} from '../domain/model/request-field.entity';
import {RequestTypeResource, RequestTypesResponse} from './request-types-response';

/**
 * Converts between the RequestType entity, with its fields, and the resource returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export class RequestTypeAssembler implements BaseAssembler<RequestType, RequestTypeResource, RequestTypesResponse> {

  /**
   * Converts a resource to a RequestType entity, including its fields.
   *
   * @param resource - The request type resource.
   * @returns The RequestType entity
   * @author Diego Alonso Diaz Villalba
   */
  toEntityFromResource(resource: RequestTypeResource): RequestType {
    return new RequestType({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      requiresAttachment: resource.requiresAttachment,
      balanceDeduction: resource.balanceDeduction as BalanceDeduction,
      active: resource.active,
      fields: (resource.fields ?? []).map(field => new RequestField({
        id: field.id,
        key: field.key,
        label: field.label,
        dataType: field.dataType as FieldDataType,
        required: field.required,
        displayOrder: field.displayOrder
      }))
    });
  }

  /**
   * Converts a RequestType entity to a resource.
   *
   * @param entity - The RequestType entity.
   * @returns The request type resource
   * @author Diego Alonso Diaz Villalba
   */
  toResourceFromEntity(entity: RequestType): RequestTypeResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      requiresAttachment: entity.requiresAttachment,
      balanceDeduction: entity.balanceDeduction,
      active: entity.active,
      fields: entity.fields.map(field => ({
        id: field.id,
        key: field.key,
        label: field.label,
        dataType: field.dataType,
        required: field.required,
        displayOrder: field.displayOrder
      }))
    };
  }

  /**
   * Converts a response with several request types to entities.
   *
   * @param response - The request types response.
   * @returns The RequestType entities
   * @author Diego Alonso Diaz Villalba
   */
  toEntitiesFromResponse(response: RequestTypesResponse): RequestType[] {
    return response.requestTypes.map(resource => this.toEntityFromResource(resource));
  }
}
