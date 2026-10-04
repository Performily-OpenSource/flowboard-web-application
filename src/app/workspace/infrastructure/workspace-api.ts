import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Employee} from '../domain/model/employee.entity';
import {Area} from '../domain/model/area.entity';
import {Position} from '../domain/model/position.entity';
import {JobAssignment} from '../domain/model/job-assignment.entity';
import {EmployeeDocument} from '../domain/model/employee-document.entity';
import {EmployeesApiEndpoint} from './employees-api-endpoint';
import {AreasApiEndpoint} from './areas-api-endpoint';
import {PositionsApiEndpoint} from './positions-api-endpoint';
import {JobAssignmentsApiEndpoint} from './job-assignments-api-endpoint';
import {EmployeeDocumentsApiEndpoint} from './employee-documents-api-endpoint';

@Injectable({providedIn: 'root'})
/**
 * Facade of the Workspace bounded context infrastructure.
 * Groups the employees, areas, positions, job assignments and employee documents API endpoints
 * behind a single injectable service used by the application layer.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class WorkspaceApi extends BaseApi {
  private readonly employeesEndpoint: EmployeesApiEndpoint;
  private readonly areasEndpoint: AreasApiEndpoint;
  private readonly positionsEndpoint: PositionsApiEndpoint;
  private readonly jobAssignmentsEndpoint: JobAssignmentsApiEndpoint;
  private readonly employeeDocumentsEndpoint: EmployeeDocumentsApiEndpoint;

  /**
   * Creates the facade and instantiates every Workspace API endpoint.
   *
   * @param http - The Angular HttpClient shared by all endpoints.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super();
    this.employeesEndpoint = new EmployeesApiEndpoint(http);
    this.areasEndpoint = new AreasApiEndpoint(http);
    this.positionsEndpoint = new PositionsApiEndpoint(http);
    this.jobAssignmentsEndpoint = new JobAssignmentsApiEndpoint(http);
    this.employeeDocumentsEndpoint = new EmployeeDocumentsApiEndpoint(http);
  }

  /**
   * Retrieves all employees.
   *
   * @returns An observable with the list of employees
   * @author Oscar Lizandro Vasquez Llave
   */
  getEmployees(): Observable<Employee[]> {
    return this.employeesEndpoint.getAll();
  }

  /**
   * Retrieves an employee by its id.
   *
   * @param id - The identifier of the employee.
   * @returns An observable with the employee
   * @author Oscar Lizandro Vasquez Llave
   */
  getEmployee(id: number): Observable<Employee> {
    return this.employeesEndpoint.getById(id);
  }

  /**
   * Creates a new employee.
   *
   * @param employee - The employee to create.
   * @returns An observable with the created employee as returned by the API
   * @author Oscar Lizandro Vasquez Llave
   */
  createEmployee(employee: Employee): Observable<Employee> {
    return this.employeesEndpoint.create(employee);
  }

  /**
   * Updates an existing employee, identified by its id.
   *
   * @param employee - The employee with the updated data.
   * @returns An observable with the updated employee as returned by the API
   * @author Oscar Lizandro Vasquez Llave
   */
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.employeesEndpoint.update(employee, employee.id);
  }

  /**
   * Retrieves all areas.
   *
   * @returns An observable with the list of areas
   * @author Oscar Lizandro Vasquez Llave
   */
  getAreas(): Observable<Area[]> {
    return this.areasEndpoint.getAll();
  }

  /**
   * Creates a new area.
   *
   * @param area - The area to create.
   * @returns An observable with the created area as returned by the API
   * @author Oscar Lizandro Vasquez Llave
   */
  createArea(area: Area): Observable<Area> {
    return this.areasEndpoint.create(area);
  }

  /**
   * Updates an existing area, identified by its id.
   *
   * @param area - The area with the updated data.
   * @returns An observable with the updated area as returned by the API
   * @author Oscar Lizandro Vasquez Llave
   */
  updateArea(area: Area): Observable<Area> {
    return this.areasEndpoint.update(area, area.id);
  }

  /**
   * Retrieves all positions.
   *
   * @returns An observable with the list of positions
   * @author Oscar Lizandro Vasquez Llave
   */
  getPositions(): Observable<Position[]> {
    return this.positionsEndpoint.getAll();
  }

  /**
   * Creates a new position.
   *
   * @param position - The position to create.
   * @returns An observable with the created position as returned by the API
   * @author Oscar Lizandro Vasquez Llave
   */
  createPosition(position: Position): Observable<Position> {
    return this.positionsEndpoint.create(position);
  }

  /**
   * Updates an existing position, identified by its id.
   *
   * @param position - The position with the updated data.
   * @returns An observable with the updated position as returned by the API
   * @author Oscar Lizandro Vasquez Llave
   */
  updatePosition(position: Position): Observable<Position> {
    return this.positionsEndpoint.update(position, position.id);
  }

  /**
   * Retrieves the job assignments (job history) of an employee.
   *
   * @param employeeId - The identifier of the employee.
   * @returns An observable with the employee's job assignments
   * @author Oscar Lizandro Vasquez Llave
   */
  getJobAssignmentsByEmployeeId(employeeId: number): Observable<JobAssignment[]> {
    return this.jobAssignmentsEndpoint.getByEmployeeId(employeeId);
  }

  /**
   * Retrieves the documents attached to an employee.
   *
   * @param employeeId - The identifier of the employee.
   * @returns An observable with the employee's documents
   * @author Oscar Lizandro Vasquez Llave
   */
  getEmployeeDocumentsByEmployeeId(employeeId: number): Observable<EmployeeDocument[]> {
    return this.employeeDocumentsEndpoint.getByEmployeeId(employeeId);
  }

  /**
   * Registers a new employee document.
   *
   * @param document - The document to create.
   * @returns An observable with the created document as returned by the API
   * @author Oscar Lizandro Vasquez Llave
   */
  createEmployeeDocument(document: EmployeeDocument): Observable<EmployeeDocument> {
    return this.employeeDocumentsEndpoint.create(document);
  }

  /**
   * Deletes an employee document by its id.
   *
   * @param id - The identifier of the document to delete.
   * @returns An observable that completes when the document is deleted
   * @author Oscar Lizandro Vasquez Llave
   */
  deleteEmployeeDocument(id: number): Observable<void> {
    return this.employeeDocumentsEndpoint.delete(id);
  }
}
