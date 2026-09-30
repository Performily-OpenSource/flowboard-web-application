import { AttendanceRecord, AttendanceStatus } from '../domain/model/attendance-record.entity';
import { AttendanceRecordResponse } from './attendance-records-response';

export class AttendanceRecordAssembler {
  static toEntity(response: AttendanceRecordResponse): AttendanceRecord {
    return new AttendanceRecord({
      id: response.id,
      employeeId: response.employeeId,
      workDate: response.workDate,
      entryTime: response.entryTime,
      exitTime: response.exitTime,
      effectiveHours: response.effectiveHours,
      status: response.status as AttendanceStatus
    });
  }

  static toEntityArray(responses: AttendanceRecordResponse[]): AttendanceRecord[] {
    return responses.map(response => this.toEntity(response));
  }
}