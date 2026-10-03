import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {WorkSchedule} from '../domain/model/work-schedule.entity';
import {WorkScheduleResource, WorkSchedulesResponse} from './work-schedules-response';

/**
 * Converts work-schedule API resources to and from the WorkSchedule domain entity.
 *
 * @remarks Keeps transport mapping separate from work-schedule domain behavior.
 * @author Dario Avila de la cruz
 */
export class WorkScheduleAssembler implements BaseAssembler<WorkSchedule, WorkScheduleResource, WorkSchedulesResponse> {
/**
 * Converts an API resource into its corresponding domain entity.
 *
 * @param resource the API resource to convert.
 * @returns The corresponding domain entity.
 * @author Dario Avila de la cruz
 */
  toEntityFromResource(resource: WorkScheduleResource): WorkSchedule {
    return new WorkSchedule(resource);
  }

/**
 * Converts a domain entity into its API resource representation.
 *
 * @param entity the domain entity to convert.
 * @returns The corresponding API resource.
 * @author Dario Avila de la cruz
 */
  toResourceFromEntity(entity: WorkSchedule): WorkScheduleResource {
    return {
      id: entity.id,
      positionId: entity.positionId,
      shiftStartTime: entity.shiftStartTime,
      shiftEndTime: entity.shiftEndTime,
      lateToleranceMinutes: entity.lateToleranceMinutes,
      workingDays: entity.workingDays
    };
  }

/**
 * Converts all resources in an API response into domain entities.
 *
 * @param response the API response to convert.
 * @returns The domain entities represented by the response.
 * @author Dario Avila de la cruz
 */
  toEntitiesFromResponse(response: WorkSchedulesResponse): WorkSchedule[] {
    return response.workSchedules.map(resource => this.toEntityFromResource(resource));
  }
}
