import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {AttendanceRecord} from '../domain/model/attendance-record.entity';
import {AttendanceRecordResource, AttendanceRecordsResponse} from './attendance-records-response';
import {AttendanceRecordAssembler} from './attendance-record-assembler';

/**
 * Provides the HTTP endpoint configuration for attendance records.
 *
 * @remarks Binds the generic API endpoint infrastructure to attendance record resources and the configured platform URL.
 * @author Dario Avila de la cruz
 */
export class AttendanceRecordsApiEndpoint extends BaseApiEndpoint<AttendanceRecord, AttendanceRecordResource, AttendanceRecordsResponse, AttendanceRecordAssembler> {
/**
 * Performs the constructor operation.
 *
 * @param http the HTTP client dependency.
 * @author Dario Avila de la cruz
 */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderAttendanceRecordsEndpointPath}`, new AttendanceRecordAssembler());
  }
}
