import {computed, inject, Injectable} from '@angular/core';
import {WorkspaceStore} from '../../workspace/application/workspace.store';

/** What Benefits needs to know about an employee. Workspace owns the real data. */
export interface EmployeeSummary {
  id: number;
  fullName: string;
  initials: string;
  positionTitle: string;
  areaId: number;
  areaName: string;
  active: boolean;
}

export interface AreaSummary {
  id: number;
  name: string;
  active: boolean;
}

/**
 * Anti-corruption layer towards the Workspace bounded context (read only).
 * Benefits only refers to employees and areas by their ids (EmployeeId / AreaId of the Shared Kernel)
 * and reads the names it shows through this directory.
 */
@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  private workspace = inject(WorkspaceStore);

  readonly employees = computed<EmployeeSummary[]>(() => this.workspace.employees().map(employee => ({
    id: employee.id,
    fullName: employee.fullName,
    initials: `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase(),
    positionTitle: employee.position?.title ?? '',
    areaId: employee.areaId,
    areaName: employee.area?.name ?? '',
    active: employee.isActive()
  })));

  readonly activeEmployees = computed(() => this.employees().filter(employee => employee.active));

  readonly areas = computed<AreaSummary[]>(() =>
    this.workspace.areas().map(area => ({ id: area.id, name: area.name, active: area.active })));

  readonly activeAreas = computed(() => this.areas().filter(area => area.active));

  private readonly employeesById = computed(() => new Map(this.employees().map(employee => [employee.id, employee])));

  findEmployee(id: number): EmployeeSummary | undefined {
    return this.employeesById().get(id);
  }

  activeEmployeeIdsOfArea(areaId: number): number[] {
    return this.activeEmployees().filter(employee => employee.areaId === areaId).map(employee => employee.id);
  }
}
