export interface AttendanceRecordResponse {
  id: string;
  employeeId: string;
  workDate: string;
  entryTime: string | null;
  exitTime: string | null;
  effectiveHours: number | null;
  status: string;
}