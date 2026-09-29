import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface PositionResource extends BaseResource {
  id: number;
  title: string;
  areaId: number;
  referenceSalaryAmount: number;
  referenceSalaryCurrency: string;
  active: boolean;
}

export interface PositionsResponse extends BaseResponse {
  positions: PositionResource[];
}
