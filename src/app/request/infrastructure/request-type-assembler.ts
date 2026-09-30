import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {BalanceDeduction, RequestType} from '../domain/model/request-type.entity';
import {FieldDataType, RequestField} from '../domain/model/request-field.entity';
import {RequestTypeResource, RequestTypesResponse} from './request-types-response';

export class RequestTypeAssembler implements BaseAssembler<RequestType, RequestTypeResource, RequestTypesResponse> {

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

  toEntitiesFromResponse(response: RequestTypesResponse): RequestType[] {
    return response.requestTypes.map(resource => this.toEntityFromResource(resource));
  }
}
