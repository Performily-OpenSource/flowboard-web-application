import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of a position returned by the API. */
export interface PositionResource extends BaseResource {
  id: number;
  title: string;
  /** Identifier of the area the position belongs to. */
  areaId: number;
  referenceSalaryAmount: number;
  referenceSalaryCurrency: string;
  active: boolean;
}

/** Response wrapper returned by the API when the positions are listed inside a 'positions' property. */
export interface PositionsResponse extends BaseResponse {
  positions: PositionResource[];
}
