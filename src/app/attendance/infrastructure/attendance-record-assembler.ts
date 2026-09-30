import { AttendanceRecord } from '../domain/model/attendance-record.entity';
import { AttendanceRecordsResponse } from './attendance-records-response';

export class AttendanceRecordAssembler {
  static toEntity(response: AttendanceRecordsResponse): AttendanceRecord {
    return new AttendanceRecord(
      response.id,
      response.employee_id,
      new Date(response.work_date),
      response.entry_time,
      response.exit_time,
      response.status
    );
  }

  static toEntityList(responses: AttendanceRecordsResponse[]): AttendanceRecord[] {
    return responses.map(res => this.toEntity(res));
  }
}