import {computed, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {retry} from 'rxjs';
import {WorkspaceApi} from '../infrastructure/workspace-api';
import {ContractType, Employee, EmploymentStatus} from '../domain/model/employee.entity';
import {Area} from '../domain/model/area.entity';
import {Position} from '../domain/model/position.entity';
import {JobAssignment} from '../domain/model/job-assignment.entity';
import {DocumentType, EmployeeDocument} from '../domain/model/employee-document.entity';

export interface OrganizationChartNode {
  employee: Employee;
  subordinates: OrganizationChartNode[];
}

export interface OrganizationChart {
  roots: OrganizationChartNode[];
  pendingReassignment: Employee[];
}

export interface PendingEmployeeDocument {
  documentType: DocumentType;
  file: File;
}

@Injectable({providedIn: 'root'})
export class WorkspaceStore {
  private readonly employeesSignal = signal<Employee[]>([]);
  private readonly areasSignal = signal<Area[]>([]);
  private readonly positionsSignal = signal<Position[]>([]);
  private readonly jobAssignmentsSignal = signal<JobAssignment[]>([]);
  private readonly employeeDocumentsSignal = signal<EmployeeDocument[]>([]);

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly areas = this.areasSignal.asReadonly();

  readonly positions = computed(() => {
    const areas = this.areasSignal();
    return this.positionsSignal().map(position => {
      position.area = areas.find(area => area.id === position.areaId) ?? null;
      return position;
    });
  });

  readonly employees = computed(() => {
    const areas = this.areasSignal();
    const positions = this.positions();
    return this.employeesSignal().map(employee => {
      employee.area = areas.find(area => area.id === employee.areaId) ?? null;
      employee.position = positions.find(position => position.id === employee.positionId) ?? null;
      return employee;
    });
  });

  readonly jobAssignments = computed(() => {
    const areas = this.areasSignal();
    const positions = this.positions();
    return this.jobAssignmentsSignal()
      .map(assignment => {
        assignment.area = areas.find(area => area.id === assignment.areaId) ?? null;
        assignment.position = positions.find(position => position.id === assignment.positionId) ?? null;
        return assignment;
      })
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  });

  readonly employeeDocuments = computed(() =>
    [...this.employeeDocumentsSignal()].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));

  readonly activeEmployees = computed(() => this.employees().filter(employee => employee.isActive()));

  readonly statusSummary = computed(() => {
    const employees = this.employeesSignal();
    return {
      active: employees.filter(employee => employee.status === 'ACTIVE').length,
      terminated: employees.filter(employee => employee.status === 'TERMINATED').length,
      suspended: employees.filter(employee => employee.status === 'SUSPENDED').length
    };
  });
  readonly activeAreas = computed(() => this.areasSignal().filter(area => area.active));
  readonly activePositions = computed(() => this.positions().filter(position => position.active));

  constructor(private workspaceApi: WorkspaceApi) {
    this.loadAreas();
    this.loadPositions();
    this.loadEmployees();
  }

  getEmployeeById(id: number): Signal<Employee | undefined> {
    return computed(() => id ? this.employees().find(employee => employee.id === id) : undefined);
  }

  getAreaById(id: number): Signal<Area | undefined> {
    return computed(() => id ? this.areasSignal().find(area => area.id === id) : undefined);
  }

  getPositionById(id: number): Signal<Position | undefined> {
    return computed(() => id ? this.positions().find(position => position.id === id) : undefined);
  }

  getSubordinates(managerId: number): Signal<Employee[]> {
    return computed(() => this.employees().filter(employee =>
      employee.directManagerId === managerId && !employee.isTerminated()));
  }

  getReportingLine(employeeId: number): Signal<Employee[]> {
    return computed(() => {
      const line: Employee[] = [];
      const visited = new Set<number>([employeeId]);
      let managerId = this.employees().find(employee => employee.id === employeeId)?.directManagerId ?? null;
      while (managerId !== null && !visited.has(managerId)) {
        const manager = this.employees().find(employee => employee.id === managerId);
        if (!manager) break;
        line.push(manager);
        visited.add(manager.id);
        managerId = manager.directManagerId;
      }
      return line;
    });
  }

  getActivePositionsByArea(areaId: number | null): Position[] {
    return areaId ? this.activePositions().filter(position => position.belongsTo(areaId)) : [];
  }

  countActiveEmployeesInArea(areaId: number): number {
    return this.activeEmployees().filter(employee => employee.areaId === areaId).length;
  }

  countPositionsInArea(areaId: number): number {
    return this.positions().filter(position => position.areaId === areaId).length;
  }

  isIdentityDocumentTaken(type: string, number: string, excludedEmployeeId: number | null): boolean {
    return this.activeEmployees().some(employee =>
      employee.id !== excludedEmployeeId &&
      employee.identityDocumentType === type &&
      employee.identityDocumentNumber === number);
  }

  wouldCreateCycle(employeeId: number | null, managerId: number): boolean {
    if (employeeId === null) return false;
    if (employeeId === managerId) return true;
    const visited = new Set<number>();
    let currentId: number | null = managerId;
    while (currentId !== null && !visited.has(currentId)) {
      if (currentId === employeeId) return true;
      visited.add(currentId);
      currentId = this.employees().find(employee => employee.id === currentId)?.directManagerId ?? null;
    }
    return false;
  }

  getCyclePath(employeeId: number, managerId: number): Employee[] {
    if (!this.wouldCreateCycle(employeeId, managerId)) return [];
    const byId = new Map(this.employees().map(employee => [employee.id, employee]));
    const employee = byId.get(employeeId);
    const path: Employee[] = employee ? [employee] : [];
    let current = byId.get(managerId);
    const visited = new Set<number>();
    while (current && current.id !== employeeId && !visited.has(current.id)) {
      path.push(current);
      visited.add(current.id);
      current = current.directManagerId !== null ? byId.get(current.directManagerId) : undefined;
    }
    if (employee) path.push(employee);
    return path;
  }

  buildOrganizationChart(areaId: number | null): OrganizationChart {
    const active = this.activeEmployees().filter(employee => areaId === null || employee.areaId === areaId);
    const activeIds = new Set(this.activeEmployees().map(employee => employee.id));
    const scopeIds = new Set(active.map(employee => employee.id));

    const pendingReassignment = active.filter(employee =>
      employee.directManagerId !== null && !activeIds.has(employee.directManagerId));

    const buildNode = (employee: Employee, visited: Set<number>): OrganizationChartNode => {
      visited.add(employee.id);
      return {
        employee,
        subordinates: active
          .filter(subordinate => subordinate.directManagerId === employee.id && !visited.has(subordinate.id))
          .map(subordinate => buildNode(subordinate, visited))
      };
    };

    const visited = new Set<number>();
    const roots = active
      .filter(employee =>
        employee.directManagerId === null ||
        (activeIds.has(employee.directManagerId) && !scopeIds.has(employee.directManagerId)))
      .map(root => buildNode(root, visited));

    return { roots, pendingReassignment };
  }


  addEmployee(employee: Employee, documents: PendingEmployeeDocument[] = []): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.createEmployee(employee).pipe(retry(2)).subscribe({
      next: createdEmployee => {
        this.employeesSignal.update(employees => [...employees, createdEmployee]);
        documents.forEach(document => this.addEmployeeDocument(createdEmployee.id, document.documentType, document.file));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to add employee'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateEmployee(employee: Employee): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.updateEmployee(employee).pipe(retry(2)).subscribe({
      next: updatedEmployee => {
        this.employeesSignal.update(employees =>
          employees.map(current => current.id === updatedEmployee.id ? updatedEmployee : current));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to update employee'));
        this.loadingSignal.set(false);
      }
    });
  }

  assignDirectManager(employee: Employee, managerId: number | null): void {
    if (managerId !== null && this.wouldCreateCycle(employee.id, managerId)) {
      this.errorSignal.set('The assignment would create a cycle in the hierarchy.');
      return;
    }
    const updated = this.copyEmployee(employee);
    updated.directManagerId = managerId;
    this.updateEmployee(updated);
  }

  changeEmployeeStatus(employee: Employee, status: Extract<EmploymentStatus, 'ACTIVE' | 'SUSPENDED'>): void {
    const updated = this.copyEmployee(employee);
    updated.status = status;
    this.updateEmployee(updated);
  }

  terminateEmployee(employee: Employee, terminationReason: string, terminationDate: string): void {
    if (this.getSubordinates(employee.id)().length > 0) {
      this.errorSignal.set('The employee has subordinates. Reassign them before the termination.');
      return;
    }
    const terminated = this.copyEmployee(employee);
    terminated.status = 'TERMINATED';
    terminated.terminationReason = terminationReason;
    terminated.terminationDate = terminationDate;
    this.updateEmployee(terminated);
  }

  reinstateEmployee(employee: Employee, reinstatement: {
    areaId: number;
    positionId: number;
    reinstatementDate: string;
    contractType: ContractType;
  }): void {
    const reinstated = this.copyEmployee(employee);
    reinstated.status = 'ACTIVE';
    reinstated.areaId = reinstatement.areaId;
    reinstated.positionId = reinstatement.positionId;
    reinstated.hireDate = reinstatement.reinstatementDate;
    reinstated.contractType = reinstatement.contractType;
    reinstated.contractEndDate = null;
    reinstated.terminationReason = null;
    reinstated.terminationDate = null;
    this.updateEmployee(reinstated);
  }

  addArea(area: Area): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.createArea(area).pipe(retry(2)).subscribe({
      next: createdArea => {
        this.areasSignal.update(areas => [...areas, createdArea]);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to add area'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateArea(area: Area): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.updateArea(area).pipe(retry(2)).subscribe({
      next: updatedArea => {
        this.areasSignal.update(areas => areas.map(current => current.id === updatedArea.id ? updatedArea : current));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to update area'));
        this.loadingSignal.set(false);
      }
    });
  }

  toggleAreaStatus(area: Area): void {
    if (area.active && this.countActiveEmployeesInArea(area.id) > 0) {
      this.errorSignal.set('An area with active employees cannot be deactivated. Reassign them first.');
      return;
    }
    this.updateArea(new Area({
      id: area.id,
      name: area.name,
      description: area.description,
      active: !area.active
    }));
  }


  addPosition(position: Position): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.createPosition(position).pipe(retry(2)).subscribe({
      next: createdPosition => {
        this.positionsSignal.update(positions => [...positions, createdPosition]);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to add position'));
        this.loadingSignal.set(false);
      }
    });
  }

  updatePosition(position: Position): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.updatePosition(position).pipe(retry(2)).subscribe({
      next: updatedPosition => {
        this.positionsSignal.update(positions =>
          positions.map(current => current.id === updatedPosition.id ? updatedPosition : current));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to update position'));
        this.loadingSignal.set(false);
      }
    });
  }

  togglePositionStatus(position: Position): void {
    this.updatePosition(new Position({
      id: position.id,
      title: position.title,
      areaId: position.areaId,
      referenceSalaryAmount: position.referenceSalaryAmount,
      referenceSalaryCurrency: position.referenceSalaryCurrency,
      active: !position.active
    }));
  }


  loadEmployeeRecords(employeeId: number): void {
    this.jobAssignmentsSignal.set([]);
    this.employeeDocumentsSignal.set([]);
    this.workspaceApi.getJobAssignmentsByEmployeeId(employeeId).subscribe({
      next: assignments => this.jobAssignmentsSignal.set(assignments),
      error: error => this.errorSignal.set(this.formatError(error, 'Failed to load job assignments'))
    });
    this.workspaceApi.getEmployeeDocumentsByEmployeeId(employeeId).subscribe({
      next: documents => this.employeeDocumentsSignal.set(documents),
      error: error => this.errorSignal.set(this.formatError(error, 'Failed to load employee documents'))
    });
  }

  addEmployeeDocument(employeeId: number, documentType: DocumentType, file: File): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const document = new EmployeeDocument({
      id: 0,
      employeeId,
      documentType,
      fileName: file.name,
      contentType: file.type,
      sizeInBytes: file.size,
      storageUrl: '',
      uploadedAt: new Date().toISOString()
    });
    this.workspaceApi.createEmployeeDocument(document).pipe(retry(2)).subscribe({
      next: createdDocument => {
        this.employeeDocumentsSignal.update(documents => [...documents, createdDocument]);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to upload document'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteEmployeeDocument(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.deleteEmployeeDocument(id).pipe(retry(2)).subscribe({
      next: () => {
        this.employeeDocumentsSignal.update(documents => documents.filter(document => document.id !== id));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to delete document'));
        this.loadingSignal.set(false);
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }


  private loadEmployees(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.workspaceApi.getEmployees().pipe(takeUntilDestroyed()).subscribe({
      next: employees => {
        this.employeesSignal.set(employees);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to load employees'));
        this.loadingSignal.set(false);
      }
    });
  }

  private loadAreas(): void {
    this.workspaceApi.getAreas().pipe(takeUntilDestroyed()).subscribe({
      next: areas => this.areasSignal.set(areas),
      error: error => this.errorSignal.set(this.formatError(error, 'Failed to load areas'))
    });
  }

  private loadPositions(): void {
    this.workspaceApi.getPositions().pipe(takeUntilDestroyed()).subscribe({
      next: positions => this.positionsSignal.set(positions),
      error: error => this.errorSignal.set(this.formatError(error, 'Failed to load positions'))
    });
  }

  private copyEmployee(employee: Employee): Employee {
    return new Employee({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      identityDocumentType: employee.identityDocumentType,
      identityDocumentNumber: employee.identityDocumentNumber,
      birthDate: employee.birthDate,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      addressStreet: employee.addressStreet,
      addressDistrict: employee.addressDistrict,
      addressProvince: employee.addressProvince,
      addressDepartment: employee.addressDepartment,
      contractType: employee.contractType,
      hireDate: employee.hireDate,
      contractEndDate: employee.contractEndDate,
      status: employee.status,
      terminationReason: employee.terminationReason,
      terminationDate: employee.terminationDate,
      areaId: employee.areaId,
      positionId: employee.positionId,
      directManagerId: employee.directManagerId
    });
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
