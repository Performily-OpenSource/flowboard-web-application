import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface RequestFieldResource {
  id: number;
  key: string;
  label: string;
  dataType: string;
  required: boolean;
  displayOrder: number;
}

export interface RequestTypeResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  requiresAttachment: boolean;
  balanceDeduction: string;
  active: boolean;
  fields: RequestFieldResource[];
}

export interface RequestTypesResponse extends BaseResponse {
  requestTypes: RequestTypeResource[];
}
