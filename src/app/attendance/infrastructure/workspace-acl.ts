import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {WorkspaceApi} from '../../workspace/infrastructure/workspace-api';
import {AttendanceArea} from '../domain/model/attendance-area.entity';
import {AttendanceEmployee} from '../domain/model/attendance-employee.entity';

/**
 * Provides Attendance access to employee and area information owned by Workspace.
 *
 * @remarks Implements the anti-corruption access used by Attendance to consume Workspace data without owning the Workspace model.
 * @author Dario Avila de la cruz
 */
@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
/**
 * Performs the constructor operation.
 *
 * @author Dario Avila de la cruz
 */
  constructor(private readonly workspaceApi: WorkspaceApi) {}

/**
 * Retrieves employee information required by the bounded context from Workspace.
 *
 * @returns The value produced by the `getEmployees` operation.
 * @author Dario Avila de la cruz
 */
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

/**
 * Performs the getAreas operation.
 *
 * @returns The value produced by the `getAreas` operation.
 * @author Dario Avila de la cruz
 */
  getAreas(): Observable<AttendanceArea[]> {
    return this.workspaceApi.getAreas().pipe(
      map(areas => areas.map(area => new AttendanceArea(area.id, area.name)))
    );
  }
}
