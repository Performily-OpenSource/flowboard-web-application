import {computed, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {retry} from 'rxjs';
import {WorkspaceApi} from '../infrastructure/workspace-api';
import {ContractType, Employee, EmploymentStatus} from '../domain/model/employee.entity';
import {Area} from '../domain/model/area.entity';
import {Position} from '../domain/model/position.entity';
import {JobAssignment} from '../domain/model/job-assignment.entity';
import {DocumentType, EmployeeDocument} from '../domain/model/employee-document.entity';

/**
 * Node of the organization chart tree.
 *
 * @remarks Built at query time from each employee's directManagerId; it is not persisted.
 * @author Oscar Lizandro Vasquez Llave
 */
export interface OrganizationChartNode {
  /** The employee represented by this node. */
  employee: Employee;
  /** Active employees in scope that report directly to this employee. */
  subordinates: OrganizationChartNode[];
}

/**
 * Organization chart query result (US12, US13).
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface OrganizationChart {
  /** Top-level nodes: employees without a manager, or whose active manager lies outside the selected area. */
  roots: OrganizationChartNode[];
  /** Active employees whose direct manager is no longer active, shown in the "pending reassignment" group. */
  pendingReassignment: Employee[];
}

/**
 * Document selected in the employee registration form, uploaded once the employee is created.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface PendingEmployeeDocument {
  /** The type of document being attached. */
  documentType: DocumentType;
  /** The file selected by the user. */
  file: File;
}

/**
 * Application service that holds the state of the Workspace bounded context.
 *
 * @remarks
 * Keeps employees, areas, positions, job assignments and employee documents in private signals
 * and exposes them as read-only or computed signals. Areas, positions and employees are loaded
 * on creation; operations call the WorkspaceApi and report failures through the error signal.
 * @author Oscar Lizandro Vasquez Llave
 */
@Injectable({providedIn: 'root'})
export class WorkspaceStore {
  /** Employees loaded from the API. */
  private readonly employeesSignal = signal<Employee[]>([]);
  /** Areas loaded from the API. */
  private readonly areasSignal = signal<Area[]>([]);
  /** Positions loaded from the API. */
  private readonly positionsSignal = signal<Position[]>([]);
  /** Job assignment history of the employee whose records are loaded. */
  private readonly jobAssignmentsSignal = signal<JobAssignment[]>([]);
  /** Documents of the employee whose records are loaded. */
  private readonly employeeDocumentsSignal = signal<EmployeeDocument[]>([]);

  /** Whether a load or write operation is in progress. */
  private readonly loadingSignal = signal<boolean>(false);
  /** Read-only loading state. */
  readonly loading = this.loadingSignal.asReadonly();

  /** Last error message, or null when there is none. */
  private readonly errorSignal = signal<string | null>(null);
  /** Read-only error message. */
  readonly error = this.errorSignal.asReadonly();

  /** Read-only list of all areas (US09). */
  readonly areas = this.areasSignal.asReadonly();

  /** Positions with their area resolved. */
  readonly positions = computed(() => {
    const areas = this.areasSignal();
    return this.positionsSignal().map(position => {
      position.area = areas.find(area => area.id === position.areaId) ?? null;
      return position;
    });
  });

  /** Employees with their area and position resolved. */
  readonly employees = computed(() => {
    const areas = this.areasSignal();
    const positions = this.positions();
    return this.employeesSignal().map(employee => {
      employee.area = areas.find(area => area.id === employee.areaId) ?? null;
      employee.position = positions.find(position => position.id === employee.positionId) ?? null;
      return employee;
    });
  });

  /** Job assignments with area and position resolved, newest start date first (US10). */
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

  /** Employee documents, most recently uploaded first. */
  readonly employeeDocuments = computed(() =>
    [...this.employeeDocumentsSignal()].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));

  /** Employees whose status is active. */
  readonly activeEmployees = computed(() => this.employees().filter(employee => employee.isActive()));

  /** Number of employees per status: active, terminated and suspended. */
  readonly statusSummary = computed(() => {
    const employees = this.employeesSignal();
    return {
      active: employees.filter(employee => employee.status === 'ACTIVE').length,
      terminated: employees.filter(employee => employee.status === 'TERMINATED').length,
      suspended: employees.filter(employee => employee.status === 'SUSPENDED').length
    };
  });
  /** Areas marked as active. */
  readonly activeAreas = computed(() => this.areasSignal().filter(area => area.active));
  /** Positions marked as active. */
  readonly activePositions = computed(() => this.positions().filter(position => position.active));

  /**
   * Creates the store and loads areas, positions and employees.
   *
   * @param workspaceApi - The API facade of the Workspace bounded context.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(private workspaceApi: WorkspaceApi) {
    this.loadAreas();
    this.loadPositions();
    this.loadEmployees();
  }

  /**
   * Gets an employee by its identifier.
   *
   * @param id - The employee identifier.
   * @returns A signal with the employee, or undefined if not found
   * @author Oscar Lizandro Vasquez Llave
   */
  getEmployeeById(id: number): Signal<Employee | undefined> {
    return computed(() => id ? this.employees().find(employee => employee.id === id) : undefined);
  }

  /**
   * Gets an area by its identifier.
   *
   * @param id - The area identifier.
   * @returns A signal with the area, or undefined if not found
   * @author Oscar Lizandro Vasquez Llave
   */
  getAreaById(id: number): Signal<Area | undefined> {
    return computed(() => id ? this.areasSignal().find(area => area.id === id) : undefined);
  }

  /**
   * Gets a position by its identifier.
   *
   * @param id - The position identifier.
   * @returns A signal with the position, or undefined if not found
   * @author Oscar Lizandro Vasquez Llave
   */
  getPositionById(id: number): Signal<Position | undefined> {
    return computed(() => id ? this.positions().find(position => position.id === id) : undefined);
  }

  /**
   * Gets the non-terminated employees that report directly to a manager (US11).
   *
   * @param managerId - The manager's employee identifier.
   * @returns A signal with the direct subordinates
   * @author Oscar Lizandro Vasquez Llave
   */
  getSubordinates(managerId: number): Signal<Employee[]> {
    return computed(() => this.employees().filter(employee =>
      employee.directManagerId === managerId && !employee.isTerminated()));
  }

  /**
   * Gets the chain of managers above an employee, from the direct manager upwards.
   *
   * @remarks Stops at the top of the hierarchy, at a missing manager or at an already visited employee.
   * @param employeeId - The employee identifier.
   * @returns A signal with the managers, nearest first
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Gets the active positions of an area (US10).
   *
   * @param areaId - The area identifier, or null.
   * @returns The active positions of the area, or an empty list if no area is given
   * @author Oscar Lizandro Vasquez Llave
   */
  getActivePositionsByArea(areaId: number | null): Position[] {
    return areaId ? this.activePositions().filter(position => position.belongsTo(areaId)) : [];
  }

  /**
   * Counts the active employees assigned to an area.
   *
   * @param areaId - The area identifier.
   * @returns The number of active employees in the area
   * @author Oscar Lizandro Vasquez Llave
   */
  countActiveEmployeesInArea(areaId: number): number {
    return this.activeEmployees().filter(employee => employee.areaId === areaId).length;
  }

  /**
   * Counts the positions defined in an area, active or not.
   *
   * @param areaId - The area identifier.
   * @returns The number of positions in the area
   * @author Oscar Lizandro Vasquez Llave
   */
  countPositionsInArea(areaId: number): number {
    return this.positions().filter(position => position.areaId === areaId).length;
  }

  /**
   * Checks if an identity document is already used by another active employee (US08, US14).
   *
   * @param type               - The identity document type.
   * @param number             - The identity document number.
   * @param excludedEmployeeId - The employee to ignore (the one being edited), or null.
   * @returns True if an active employee already has the document, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  isIdentityDocumentTaken(type: string, number: string, excludedEmployeeId: number | null): boolean {
    return this.activeEmployees().some(employee =>
      employee.id !== excludedEmployeeId &&
      employee.identityDocumentType === type &&
      employee.identityDocumentNumber === number);
  }

  /**
   * Checks if assigning a manager would make the employee its own manager or create a cycle (US11).
   *
   * @param employeeId - The employee identifier, or null for a new employee.
   * @param managerId  - The candidate manager identifier.
   * @returns True if the assignment would create a cycle, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Gets the employees that would form a cycle if the manager were assigned.
   *
   * @param employeeId - The employee identifier.
   * @param managerId  - The candidate manager identifier.
   * @returns The cycle path starting and ending with the employee, or an empty list if there is no cycle
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Builds the organization chart from the directManagerId of active employees (US12, US13).
   *
   * @remarks Employees whose manager is no longer active are listed in the pending reassignment group.
   * @param areaId - The area to filter by, or null for the general chart.
   * @returns The chart roots and the employees pending reassignment
   * @author Oscar Lizandro Vasquez Llave
   */
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


  /**
   * Registers an employee and then uploads its pending documents (US08).
   *
   * @remarks Appends the created employee to the employees signal; errors are reported through the error signal.
   * @param employee  - The employee to create.
   * @param documents - The documents to upload after creation.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Updates an employee (US14) and replaces it in the employees signal.
   *
   * @remarks Errors are reported through the error signal.
   * @param employee - The employee with the new data.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Assigns or removes the direct manager of an employee (US11).
   *
   * @remarks Rejects the change through the error signal if it would create a cycle in the hierarchy.
   * @param employee  - The employee to update.
   * @param managerId - The new manager identifier, or null to remove it.
   * @author Oscar Lizandro Vasquez Llave
   */
  assignDirectManager(employee: Employee, managerId: number | null): void {
    if (managerId !== null && this.wouldCreateCycle(employee.id, managerId)) {
      this.errorSignal.set('The assignment would create a cycle in the hierarchy.');
      return;
    }
    const updated = this.copyEmployee(employee);
    updated.directManagerId = managerId;
    this.updateEmployee(updated);
  }

  /**
   * Changes the status of an employee to active or suspended.
   *
   * @param employee - The employee to update.
   * @param status   - The new status.
   * @author Oscar Lizandro Vasquez Llave
   */
  changeEmployeeStatus(employee: Employee, status: Extract<EmploymentStatus, 'ACTIVE' | 'SUSPENDED'>): void {
    const updated = this.copyEmployee(employee);
    updated.status = status;
    this.updateEmployee(updated);
  }

  /**
   * Terminates an employee (US15).
   *
   * @remarks An employee with subordinates cannot be terminated until they are reassigned; the error signal reports it.
   * @param employee          - The employee to terminate.
   * @param terminationReason - The reason for the termination.
   * @param terminationDate   - The termination date.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Reinstates a terminated employee as active (US16).
   *
   * @remarks Sets the new area, position, hire date and contract type, and clears the contract end date and termination data.
   * @param employee      - The employee to reinstate.
   * @param reinstatement - The area, position, reinstatement date and contract type.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Creates an area (US09) and appends it to the areas signal.
   *
   * @remarks Errors are reported through the error signal.
   * @param area - The area to create.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Updates an area (US09) and replaces it in the areas signal.
   *
   * @remarks Errors are reported through the error signal.
   * @param area - The area with the new data.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Activates or deactivates an area (US09).
   *
   * @remarks An area with active employees cannot be deactivated; the error signal reports it.
   * @param area - The area to toggle.
   * @author Oscar Lizandro Vasquez Llave
   */
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


  /**
   * Creates a position (US09) and appends it to the positions signal.
   *
   * @remarks Errors are reported through the error signal.
   * @param position - The position to create.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Updates a position (US09) and replaces it in the positions signal.
   *
   * @remarks Errors are reported through the error signal.
   * @param position - The position with the new data.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Activates or deactivates a position.
   *
   * @param position - The position to toggle.
   * @author Oscar Lizandro Vasquez Llave
   */
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


  /**
   * Loads the job assignments and documents of an employee.
   *
   * @remarks Clears both signals first; errors are reported through the error signal.
   * @param employeeId - The employee identifier.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Uploads the metadata of an employee document (US17) and appends it to the documents signal.
   *
   * @remarks Errors are reported through the error signal.
   * @param employeeId   - The employee that owns the document.
   * @param documentType - The type of document.
   * @param file         - The selected file; its name, type and size are stored.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Deletes an employee document and removes it from the documents signal.
   *
   * @remarks Errors are reported through the error signal.
   * @param id - The document identifier.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Clears the current error message.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  clearError(): void {
    this.errorSignal.set(null);
  }


  /**
   * Loads all employees into the employees signal.
   *
   * @remarks Errors are reported through the error signal.
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Loads all areas into the areas signal.
   *
   * @remarks Errors are reported through the error signal.
   * @author Oscar Lizandro Vasquez Llave
   */
  private loadAreas(): void {
    this.workspaceApi.getAreas().pipe(takeUntilDestroyed()).subscribe({
      next: areas => this.areasSignal.set(areas),
      error: error => this.errorSignal.set(this.formatError(error, 'Failed to load areas'))
    });
  }

  /**
   * Loads all positions into the positions signal.
   *
   * @remarks Errors are reported through the error signal.
   * @author Oscar Lizandro Vasquez Llave
   */
  private loadPositions(): void {
    this.workspaceApi.getPositions().pipe(takeUntilDestroyed()).subscribe({
      next: positions => this.positionsSignal.set(positions),
      error: error => this.errorSignal.set(this.formatError(error, 'Failed to load positions'))
    });
  }

  /**
   * Creates a copy of an employee so it can be modified without changing the stored instance.
   *
   * @param employee - The employee to copy.
   * @returns A new employee with the same data
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Builds the message shown for a failed operation.
   *
   * @param error    - The error raised by the API call.
   * @param fallback - The message to use when the error is not an Error instance.
   * @returns The error message, or the fallback with "Not found" when the resource does not exist
   * @author Oscar Lizandro Vasquez Llave
   */
  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
