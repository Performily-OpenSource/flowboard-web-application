import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {AttendanceRecord, AttendanceStatus} from '../domain/model/attendance-record.entity';
import {AttendanceRecordResource, AttendanceRecordsResponse} from './attendance-records-response';

export class AttendanceRecordAssembler implements BaseAssembler<AttendanceRecord, AttendanceRecordResource, AttendanceRecordsResponse> {
  toEntityFromResource(resource: AttendanceRecordResource): AttendanceRecord {
    return new AttendanceRecord({
      id: resource.id,
      employeeId: resource.employeeId,
      workDate: resource.workDate,
      checkInTime: resource.checkInTime,
      checkOutTime: resource.checkOutTime,
      workedHours: resource.workedHours,
      overtimeHours: resource.overtimeHours,
      status: resource.status as AttendanceStatus,
      justificationReason: resource.justificationReason,
      justificationDocumentName: resource.justificationDocumentName
    });
  }

  toResourceFromEntity(entity: AttendanceRecord): AttendanceRecordResource {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      workDate: entity.workDate,
      checkInTime: entity.checkInTime,
      checkOutTime: entity.checkOutTime,
      workedHours: entity.workedHours,
      overtimeHours: entity.overtimeHours,
      status: entity.status,
      justificationReason: entity.justificationReason,
      justificationDocumentName: entity.justificationDocumentName
    };
  }

  toEntitiesFromResponse(response: AttendanceRecordsResponse): AttendanceRecord[] {
    return response.attendanceRecords.map(resource => this.toEntityFromResource(resource));
  }
}
