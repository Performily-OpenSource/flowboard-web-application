import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Field of a request type as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestFieldResource {
  /** Identifier of the field. */
  id: number;
  /** Key of the field. */
  key: string;
  /** Label of the field. */
  label: string;
  /** Data type of the field, e.g. 'TEXT'. */
  dataType: string;
  /** Whether the field is required. */
  required: boolean;
  /** Position of the field in the form. */
  displayOrder: number;
}

/**
 * Request type as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestTypeResource extends BaseResource {
  /** Identifier of the request type. */
  id: number;
  /** Name of the request type. */
  name: string;
  /** Description of the request type. */
  description: string;
  /** Whether a request needs an attached file. */
  requiresAttachment: boolean;
  /** Balance deducted on approval, e.g. 'VACATION_DAYS'. */
  balanceDeduction: string;
  /** Whether the type is active. */
  active: boolean;
  /** Fields of the request type. */
  fields: RequestFieldResource[];
}

/**
 * Response of the API with several request types.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestTypesResponse extends BaseResponse {
  /** The request types. */
  requestTypes: RequestTypeResource[];
}
