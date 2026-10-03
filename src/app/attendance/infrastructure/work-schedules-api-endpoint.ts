import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {WorkSchedule} from '../domain/model/work-schedule.entity';
import {WorkScheduleResource, WorkSchedulesResponse} from './work-schedules-response';
import {WorkScheduleAssembler} from './work-schedule-assembler';

/**
 * Provides the HTTP endpoint configuration for work schedules.
 *
 * @remarks Binds the generic API endpoint infrastructure to work-schedule resources and the configured platform URL.
 * @author Dario Avila de la cruz
 */
export class WorkSchedulesApiEndpoint extends BaseApiEndpoint<WorkSchedule, WorkScheduleResource, WorkSchedulesResponse, WorkScheduleAssembler> {
/**
 * Performs the constructor operation.
 *
 * @param http the HTTP client dependency.
 * @author Dario Avila de la cruz
 */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkSchedulesEndpointPath}`, new WorkScheduleAssembler());
  }
}
