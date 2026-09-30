import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

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

export interface AttendanceRecordsResponse extends BaseResponse {
  attendanceRecords: AttendanceRecordResource[];
}
