import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of a position returned by the API (PositionResponse). */
export interface PositionResource extends BaseResource {
  id: number;
  title: string;
  /** Identifier of the area the position belongs to. */
  areaId: number;
  areaName?: string;
  referenceSalaryAmount: number;
  referenceSalaryCurrency: string;
  active: boolean;
}

/** Payload of POST /positions (CreatePositionRequest). */
export interface CreatePositionRequest {
  title: string;
  areaId: number;
  referenceSalaryAmount: number;
  referenceSalaryCurrency: string;
}

/** Payload of PATCH /positions/{id}/reference-salary (UpdatePositionReferenceSalaryRequest). */
export interface UpdatePositionReferenceSalaryRequest {
  referenceSalaryAmount: number;
  referenceSalaryCurrency: string;
}

/** Response wrapper kept for the BaseAssembler contract; the API returns a plain array. */
export interface PositionsResponse extends BaseResponse {
  positions: PositionResource[];
}
