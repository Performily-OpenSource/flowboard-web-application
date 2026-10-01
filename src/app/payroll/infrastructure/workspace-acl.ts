import {Injectable} from '@angular/core';
import {forkJoin, map, Observable} from 'rxjs';
import {WorkspaceApi} from '../../workspace/infrastructure/workspace-api';
import {PayrollArea} from '../domain/model/payroll-area.model';
import {PayrollEmployee} from '../domain/model/payroll-employee.model';

@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  constructor(private readonly workspaceApi: WorkspaceApi) {}

  getEmployees(): Observable<PayrollEmployee[]> {
    return forkJoin({
      employees: this.workspaceApi.getEmployees(),
      areas: this.workspaceApi.getAreas(),
      positions: this.workspaceApi.getPositions()
    }).pipe(map(({employees, areas, positions}) => employees.map(employee => new PayrollEmployee({
      id: employee.id,
      fullName: `${employee.firstName} ${employee.lastName}`.trim(),
      firstName: employee.firstName,
      lastName: employee.lastName,
      document: employee.identityDocumentNumber,
      areaId: employee.areaId,
      areaName: areas.find(area => area.id === employee.areaId)?.name ?? '—',
      positionTitle: positions.find(position => position.id === employee.positionId)?.title ?? '—',
      active: employee.status === 'ACTIVE'
    }))));
  }

  getAreas(): Observable<PayrollArea[]> {
    return this.workspaceApi.getAreas().pipe(map(areas => areas.map(area => new PayrollArea(area.id, area.name))));
  }
}
