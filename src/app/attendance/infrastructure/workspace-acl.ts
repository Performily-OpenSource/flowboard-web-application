import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {WorkspaceApi} from '../../workspace/infrastructure/workspace-api';
import {AttendanceArea} from '../domain/model/attendance-area.entity';
import {AttendanceEmployee} from '../domain/model/attendance-employee.entity';

@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  constructor(private readonly workspaceApi: WorkspaceApi) {}

  getEmployees(): Observable<AttendanceEmployee[]> {
    return this.workspaceApi.getEmployees().pipe(
      map(employees => employees.map(employee => new AttendanceEmployee(
        employee.id,
        employee.fullName,
        employee.areaId,
        employee.positionId
      )))
    );
  }

  getAreas(): Observable<AttendanceArea[]> {
    return this.workspaceApi.getAreas().pipe(
      map(areas => areas.map(area => new AttendanceArea(area.id, area.name)))
    );
  }
}
