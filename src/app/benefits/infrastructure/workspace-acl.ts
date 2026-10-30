import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

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

/**
 * Employee as the Workspace context of the web service sends it (only the fields Benefits reads).
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
interface WorkspaceEmployeeResource {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  areaId: number;
  areaName: string | null;
  positionTitle: string | null;
}

/**
 * Area as the Workspace context of the web service sends it (only the fields Benefits reads).
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
interface WorkspaceAreaResource {
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
 * @remarks It reads GET /employees and GET /areas of the Flowboard Web Service (the same pattern as
 * the ACL of Attendance), so the ids match the ones that the Benefits endpoints of the web service
 * use. Known dependency: the Workspace and IAM contexts of the front end still read the fake API,
 * whose employee ids differ from the ones of the web service. The employeeId of the session (and
 * of CurrentEmployeeStore), used as the author of deliveries and adjustments and in "My benefits",
 * comes from that fake API, so it can point to another employee of the web service until IAM and
 * Workspace are migrated or both data sets are aligned. The same applies to the ids that the
 * employee file of Workspace passes to the benefits tab.
 * @author Salym
 */
export class WorkspaceAcl {
  private readonly http = inject(HttpClient);
  private readonly employeeResources = signal<WorkspaceEmployeeResource[]>([]);
  private readonly areaResources = signal<WorkspaceAreaResource[]>([]);

  readonly employees = computed<EmployeeSummary[]>(() => this.employeeResources().map(employee => ({
    id: employee.id,
    fullName: employee.fullName,
    initials: `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase(),
    positionTitle: employee.positionTitle ?? '',
    areaId: employee.areaId,
    areaName: employee.areaName ?? '',
    active: employee.status === 'ACTIVE'
  })));

  readonly activeEmployees = computed(() => this.employees().filter(employee => employee.active));

  readonly areas = computed<AreaSummary[]>(() =>
    this.areaResources().map(area => ({ id: area.id, name: area.name, active: area.active })));

  readonly activeAreas = computed(() => this.areas().filter(area => area.active));

  private readonly employeesById = computed(() => new Map(this.employees().map(employee => [employee.id, employee])));

  /**
   * Loads the employees and the areas of the web service.
   * @author Salym
   */
  constructor() {
    this.http.get<WorkspaceEmployeeResource[]>(
      `${environment.webServiceApiBaseUrl}${environment.platformProviderEmployeesEndpointPath}`).subscribe({
      next: employees => this.employeeResources.set(employees),
      error: error => console.error('benefits.workspace-acl.load-employees', error)
    });
    this.http.get<WorkspaceAreaResource[]>(
      `${environment.webServiceApiBaseUrl}${environment.platformProviderAreasEndpointPath}`).subscribe({
      next: areas => this.areaResources.set(areas),
      error: error => console.error('benefits.workspace-acl.load-areas', error)
    });
  }

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
