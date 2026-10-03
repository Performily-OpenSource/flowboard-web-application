import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Defines the transport representation of an attendance record.
 *
 * @remarks Describes the record fields exchanged with the platform attendance API.
 * @author Dario Avila de la cruz
 */
export interface AttendanceRecordResource extends BaseResource {
  id: number;
  employeeId: number;
  workDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  effectiveHours: number | null;
  overtimeHours: number | null;
  status: string;
  justificationReason: string | null;
  justificationDocumentName: string | null;
}

/**
 * Defines the transport response containing attendance records.
 *
 * @remarks Wraps attendance record resources returned by the platform API.
 * @author Dario Avila de la cruz
 */
export interface AttendanceRecordsResponse extends BaseResponse {
  attendanceRecords: AttendanceRecordResource[];
}
