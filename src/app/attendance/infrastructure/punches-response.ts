import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface PunchResource extends BaseResource {
  id: number; employeeId: number; punchedAt: string; type: string;
}
export interface PunchesResponse extends BaseResponse { punches: PunchResource[]; }
