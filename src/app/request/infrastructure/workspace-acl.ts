import {Injectable} from '@angular/core';
import {forkJoin, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {WorkspaceApi} from '../../workspace/infrastructure/workspace-api';
import {Requester} from '../domain/model/requester.entity';

@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  constructor(private workspaceApi: WorkspaceApi) {}

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
