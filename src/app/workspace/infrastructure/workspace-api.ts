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
export class WorkspaceApi extends BaseApi {
  private readonly employeesEndpoint: EmployeesApiEndpoint;
  private readonly areasEndpoint: AreasApiEndpoint;
  private readonly positionsEndpoint: PositionsApiEndpoint;
  private readonly jobAssignmentsEndpoint: JobAssignmentsApiEndpoint;
  private readonly employeeDocumentsEndpoint: EmployeeDocumentsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.employeesEndpoint = new EmployeesApiEndpoint(http);
    this.areasEndpoint = new AreasApiEndpoint(http);
    this.positionsEndpoint = new PositionsApiEndpoint(http);
    this.jobAssignmentsEndpoint = new JobAssignmentsApiEndpoint(http);
    this.employeeDocumentsEndpoint = new EmployeeDocumentsApiEndpoint(http);
  }

  getEmployees(): Observable<Employee[]> {
    return this.employeesEndpoint.getAll();
  }

  getEmployee(id: number): Observable<Employee> {
    return this.employeesEndpoint.getById(id);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.employeesEndpoint.create(employee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.employeesEndpoint.update(employee, employee.id);
  }

  getAreas(): Observable<Area[]> {
    return this.areasEndpoint.getAll();
  }

  createArea(area: Area): Observable<Area> {
    return this.areasEndpoint.create(area);
  }

  updateArea(area: Area): Observable<Area> {
    return this.areasEndpoint.update(area, area.id);
  }

  getPositions(): Observable<Position[]> {
    return this.positionsEndpoint.getAll();
  }

  createPosition(position: Position): Observable<Position> {
    return this.positionsEndpoint.create(position);
  }

  updatePosition(position: Position): Observable<Position> {
    return this.positionsEndpoint.update(position, position.id);
  }

  getJobAssignmentsByEmployeeId(employeeId: number): Observable<JobAssignment[]> {
    return this.jobAssignmentsEndpoint.getByEmployeeId(employeeId);
  }

  getEmployeeDocumentsByEmployeeId(employeeId: number): Observable<EmployeeDocument[]> {
    return this.employeeDocumentsEndpoint.getByEmployeeId(employeeId);
  }

  createEmployeeDocument(document: EmployeeDocument): Observable<EmployeeDocument> {
    return this.employeeDocumentsEndpoint.create(document);
  }

  deleteEmployeeDocument(id: number): Observable<void> {
    return this.employeeDocumentsEndpoint.delete(id);
  }
}
