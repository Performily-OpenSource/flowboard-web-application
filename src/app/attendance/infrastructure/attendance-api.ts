import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, forkJoin, map, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {AttendanceRecord, AttendanceStatus} from '../domain/model/attendance-record.entity';
import {WorkSchedule} from '../domain/model/work-schedule.entity';

/** REST adapter for the Spring Boot Attendance bounded context. */
@Injectable({providedIn: 'root'})
export class AttendanceApi {
  private readonly base = `${environment.webServiceApiBaseUrl}/attendance`;
  constructor(private readonly http: HttpClient) {}

  private mapRecord(r: BackendAttendanceRecord): AttendanceRecord {
    return new AttendanceRecord({
      id: r.id, employeeId: r.employeeId, workDate: r.workDate,
      checkInTime: r.checkInTime?.slice(11, 16) ?? null,
      checkOutTime: r.checkOutTime?.slice(11, 16) ?? null,
      effectiveHours: r.workedHours ?? null,
      overtimeHours: r.overtimeHours ?? null,
      status: r.status as AttendanceStatus,
      justificationReason: r.justificationReason ?? null,
      justificationDocumentName: null
    });
  }

  /** The backend has no GET /attendance collection; fetch each employee history. */
  getAttendanceRecords(employeeIds: number[], from: string, to: string): Observable<AttendanceRecord[]> {
    if (!employeeIds.length) return of([]);
    const params = new HttpParams().set('from', from).set('to', to);
    return forkJoin(employeeIds.map(id => this.http.get<BackendAttendanceRecord[]>(
      `${this.base}/employees/${id}`, {params}
    ))).pipe(map(groups => groups.flat().map(r => this.mapRecord(r))));
  }

  getWorkSchedules(): Observable<WorkSchedule[]> {
    return this.http.get<BackendWorkSchedule[]>(`${environment.webServiceApiBaseUrl}/work-schedules`).pipe(
      map(rows => rows.map(r => new WorkSchedule({
        id: r.id, positionId: r.positionId,
        shiftStartTime: r.startTime.slice(0, 5), shiftEndTime: r.endTime.slice(0, 5),
        lateToleranceMinutes: r.toleranceMinutes,
        workingDays: r.days.map(day => DAY_NUMBERS[day]).filter((n): n is number => n !== undefined)
      })))
    );
  }

  justifyAttendanceRecord(id: number, reason: string, evidenceUrl: string | null): Observable<AttendanceRecord> {
    return this.http.post<BackendAttendanceRecord>(`${this.base}/${id}/justification`, {
      reason, evidenceUrl
    }).pipe(map(r => this.mapRecord(r)));
  }
}

const DAY_NUMBERS: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
  THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
};
interface BackendAttendanceRecord {
  id: number; employeeId: number; workDate: string;
  checkInTime: string | null; checkOutTime: string | null;
  workedHours: number; overtimeHours: number; status: string;
  justificationReason: string | null;
}
interface BackendWorkSchedule {
  id: number; positionId: number; startTime: string; endTime: string;
  toleranceMinutes: number; days: string[];
}
