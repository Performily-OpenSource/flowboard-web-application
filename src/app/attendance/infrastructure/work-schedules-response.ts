import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface WorkScheduleResource extends BaseResource {
  id: number;
  positionId: number;
  shiftStartTime: string;
  shiftEndTime: string;
  lateToleranceMinutes: number;
  workingDays: number[];
}

export interface WorkSchedulesResponse extends BaseResponse {
  workSchedules: WorkScheduleResource[];
}
