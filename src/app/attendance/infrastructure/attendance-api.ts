import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceRecordResponse } from './attendance-records-response';
import { AttendanceRecordsApiEndpoint } from './attendance-records-api-endpoint';

@Injectable({ providedIn: 'root' })
export class AttendanceApi {
  constructor(private http: HttpClient) {}

  getRecordsByEmployeeId(employeeId: string): Observable<AttendanceRecordResponse[]> {
    return this.http.get<AttendanceRecordResponse[]>(AttendanceRecordsApiEndpoint.byEmployee(employeeId));
  }

  markEntry(employeeId: string, time: string): Observable<AttendanceRecordResponse> {
    return this.http.post<AttendanceRecordResponse>(AttendanceRecordsApiEndpoint.entry(), { employeeId, time });
  }

  markExit(id: string, employeeId: string, time: string, scheduleStartTime: string): Observable<AttendanceRecordResponse> {
    return this.http.patch<AttendanceRecordResponse>(AttendanceRecordsApiEndpoint.exit(id), { 
      employeeId, 
      time, 
      scheduleStartTime 
    });
  }
}