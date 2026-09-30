import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {WorkSchedule} from '../domain/model/work-schedule.entity';
import {WorkScheduleResource, WorkSchedulesResponse} from './work-schedules-response';
import {WorkScheduleAssembler} from './work-schedule-assembler';

export class WorkSchedulesApiEndpoint extends BaseApiEndpoint<WorkSchedule, WorkScheduleResource, WorkSchedulesResponse, WorkScheduleAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkSchedulesEndpointPath}`, new WorkScheduleAssembler());
  }
}
