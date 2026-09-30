import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {WorkSchedule} from '../domain/model/work-schedule.entity';
import {WorkScheduleResource, WorkSchedulesResponse} from './work-schedules-response';

export class WorkScheduleAssembler implements BaseAssembler<WorkSchedule, WorkScheduleResource, WorkSchedulesResponse> {
  toEntityFromResource(resource: WorkScheduleResource): WorkSchedule {
    return new WorkSchedule(resource);
  }

  toResourceFromEntity(entity: WorkSchedule): WorkScheduleResource {
    return {
      id: entity.id,
      positionId: entity.positionId,
      startTime: entity.startTime,
      endTime: entity.endTime,
      lateToleranceMinutes: entity.lateToleranceMinutes,
      workingDays: entity.workingDays
    };
  }

  toEntitiesFromResponse(response: WorkSchedulesResponse): WorkSchedule[] {
    return response.workSchedules.map(resource => this.toEntityFromResource(resource));
  }
}
