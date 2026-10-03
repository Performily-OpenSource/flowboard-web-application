import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {AttendanceRecord, AttendanceStatus} from '../domain/model/attendance-record.entity';
import {AttendanceRecordResource, AttendanceRecordsResponse} from './attendance-records-response';

/**
 * Converts attendance record API resources to and from the AttendanceRecord domain entity.
 *
 * @remarks Keeps transport mapping separate from attendance domain behavior.
 * @author Dario Avila de la cruz
 */
export class AttendanceRecordAssembler implements BaseAssembler<AttendanceRecord, AttendanceRecordResource, AttendanceRecordsResponse> {
/**
 * Converts an API resource into its corresponding domain entity.
 *
 * @param resource the API resource to convert.
 * @returns The corresponding domain entity.
 * @author Dario Avila de la cruz
 */
  toEntityFromResource(resource: AttendanceRecordResource): AttendanceRecord {
    return new AttendanceRecord({
      id: resource.id,
      employeeId: resource.employeeId,
      workDate: resource.workDate,
      checkInTime: resource.checkInTime,
      checkOutTime: resource.checkOutTime,
      effectiveHours: resource.effectiveHours,
      overtimeHours: resource.overtimeHours,
      status: resource.status as AttendanceStatus,
      justificationReason: resource.justificationReason,
      justificationDocumentName: resource.justificationDocumentName
    });
  }
  
/**
 * Converts a domain entity into its API resource representation.
 *
 * @param entity the domain entity to convert.
 * @returns The corresponding API resource.
 * @author Dario Avila de la cruz
 */
  toResourceFromEntity(entity: AttendanceRecord): AttendanceRecordResource {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      workDate: entity.workDate,
      checkInTime: entity.checkInTime,
      checkOutTime: entity.checkOutTime,
      effectiveHours: entity.effectiveHours,
      overtimeHours: entity.overtimeHours,
      status: entity.status,
      justificationReason: entity.justificationReason,
      justificationDocumentName: entity.justificationDocumentName
    };
  }

/**
 * Converts all resources in an API response into domain entities.
 *
 * @param response the API response to convert.
 * @returns The domain entities represented by the response.
 * @author Dario Avila de la cruz
 */
  toEntitiesFromResponse(response: AttendanceRecordsResponse): AttendanceRecord[] {
    return response.attendanceRecords.map(resource => this.toEntityFromResource(resource));
  }
}
