import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {AttendanceRecord} from '../domain/model/attendance-record.entity';
import {AttendanceRecordResource, AttendanceRecordsResponse} from './attendance-records-response';
import {AttendanceRecordAssembler} from './attendance-record-assembler';

export class AttendanceRecordsApiEndpoint extends BaseApiEndpoint<AttendanceRecord, AttendanceRecordResource, AttendanceRecordsResponse, AttendanceRecordAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderAttendanceRecordsEndpointPath}`, new AttendanceRecordAssembler());
  }
}
