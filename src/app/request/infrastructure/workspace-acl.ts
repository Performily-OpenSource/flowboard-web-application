import {Injectable} from '@angular/core';
import {forkJoin, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {WorkspaceApi} from '../../workspace/infrastructure/workspace-api';
import {Requester} from '../domain/model/requester.entity';

/**
 * Anti-corruption layer from the Request bounded context to Workspace.
 *
 * @remarks
 * Reads employees, areas and positions through the Workspace API and translates them to the
 * Requester read model, so Request never uses the Workspace entities directly.
 * @author Diego Alonso Diaz Villalba
 */
@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  /**
   * Creates the ACL.
   *
   * @param workspaceApi - The API facade of the Workspace bounded context.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(private workspaceApi: WorkspaceApi) {}

  /**
   * Gets every employee as a Requester, with the name of its area and the title of its position.
   *
   * @remarks An employee is Human Resources staff when it is active and belongs to environment.humanResourcesAreaId.
   * @returns An observable with the requesters
   * @author Diego Alonso Diaz Villalba
   */
  getRequesters(): Observable<Requester[]> {
    return forkJoin({
      employees: this.workspaceApi.getEmployees(),
      areas: this.workspaceApi.getAreas(),
      positions: this.workspaceApi.getPositions()
    }).pipe(map(({ employees, areas, positions }) => employees.map(employee => new Requester({
      id: employee.id,
      fullName: employee.fullName,
      initials: `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase(),
      positionTitle: positions.find(position => position.id === employee.positionId)?.title ?? '-',
      areaId: employee.areaId,
      areaName: areas.find(area => area.id === employee.areaId)?.name ?? '-',
      directManagerId: employee.directManagerId,
      active: employee.isActive(),
      hrStaff: employee.areaId === environment.humanResourcesAreaId && employee.isActive()
    }))));
  }
}
