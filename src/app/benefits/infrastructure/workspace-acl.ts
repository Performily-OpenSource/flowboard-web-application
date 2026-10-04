import {computed, inject, Injectable} from '@angular/core';
import {WorkspaceStore} from '../../workspace/application/workspace.store';

/**
 * Data of an employee that Benefits needs to show. Workspace owns the real data.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface EmployeeSummary {
  id: number;
  fullName: string;
  initials: string;
  positionTitle: string;
  areaId: number;
  areaName: string;
  active: boolean;
}

/**
 * Data of an area that Benefits needs to show and filter.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface AreaSummary {
  id: number;
  name: string;
  active: boolean;
}

@Injectable({providedIn: 'root'})
/**
 * Anti-corruption layer towards the Workspace bounded context (read only). Benefits only refers to
 * employees and areas by their ids (EmployeeId / AreaId of the Shared Kernel) and reads the names
 * it shows through this class.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
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

  /**
   * Finds the summary of an employee by its identifier.
   * @param id Identifier of the employee.
   * @author Salym
   */
  findEmployee(id: number): EmployeeSummary | undefined {
    return this.employeesById().get(id);
  }

  /**
   * Gets the identifiers of the ACTIVE employees of an area.
   * @param areaId Identifier of the area (AreaId of the Shared Kernel).
   * @author Salym
   */
  activeEmployeeIdsOfArea(areaId: number): number[] {
    return this.activeEmployees().filter(employee => employee.areaId === areaId).map(employee => employee.id);
  }
}
