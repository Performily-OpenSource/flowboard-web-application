import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Defines the transport representation of a work schedule.
 *
 * @remarks Describes the schedule fields exchanged with the platform attendance API.
 * @author Dario Avila de la cruz
 */
export interface WorkScheduleResource extends BaseResource {
  id: number;
  positionId: number;
  shiftStartTime: string;
  shiftEndTime: string;
  lateToleranceMinutes: number;
  workingDays: number[];
}

/**
 * Defines the transport response containing work schedules.
 *
 * @remarks Wraps work-schedule resources returned by the platform API.
 * @author Dario Avila de la cruz
 */
export interface WorkSchedulesResponse extends BaseResponse {
  workSchedules: WorkScheduleResource[];
}
