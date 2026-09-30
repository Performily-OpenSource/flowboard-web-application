export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'INCOMPLETE' | 'ABSENT';

export class AttendanceRecord {
  id: string;
  employeeId: string;
  workDate: string;
  entryTime: string | null;
  exitTime: string | null;
  effectiveHours: number | null;
  status: AttendanceStatus;

  constructor(data: Partial<AttendanceRecord>) {
    this.id = data.id || '';
    this.employeeId = data.employeeId || '';
    this.workDate = data.workDate || '';
    this.entryTime = data.entryTime || null;
    this.exitTime = data.exitTime || null;
    this.effectiveHours = data.effectiveHours || null;
    this.status = data.status || 'ABSENT';
  }

  isIncomplete(): boolean {
    return this.status === 'INCOMPLETE';
  }
}