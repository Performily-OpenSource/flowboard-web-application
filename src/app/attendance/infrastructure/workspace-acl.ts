import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {AttendanceArea} from '../domain/model/attendance-area.entity';
import {AttendanceEmployee} from '../domain/model/attendance-employee.entity';

/** Attendance-specific ACL: reads real Workspace data without changing Workspace code. */
@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  constructor(private readonly http: HttpClient) {}
  getEmployees(): Observable<AttendanceEmployee[]> {
    return this.http.get<BackendEmployee[]>(`${environment.webServiceApiBaseUrl}/employees`).pipe(
      map(rows => rows.map(e => new AttendanceEmployee(e.id, e.fullName, e.areaId, e.positionId)))
    );
  }
  getAreas(): Observable<AttendanceArea[]> {
    return this.http.get<BackendArea[]>(`${environment.webServiceApiBaseUrl}/areas`).pipe(
      map(rows => rows.map(a => new AttendanceArea(a.id, a.name)))
    );
  }
}
interface BackendEmployee { id: number; fullName: string; areaId: number; positionId: number; }
interface BackendArea { id: number; name: string; }
