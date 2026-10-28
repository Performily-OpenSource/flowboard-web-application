import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {Employee} from '../domain/model/employee.entity';
import {
  AssignDirectManagerRequest,
  EmployeeResource,
  EmployeesResponse,
  ReinstateEmployeeRequest,
  TerminateEmployeeRequest
} from './employees-response';
import {EmployeeAssembler} from './employee-assembler';
import {WorkspaceApiEndpoint, workspaceApiUrl} from './workspace-api-endpoint';

/**
 * API endpoint for the Employee resource of the flowboard-web-service (/api/v1/employees).
 * Besides the register and personal-data operations it exposes the direct manager, suspend,
 * terminate and reinstate operations. Every operation returns the updated employee.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeesApiEndpoint extends WorkspaceApiEndpoint<Employee, EmployeeResource, EmployeesResponse, EmployeeAssembler> {

  /**
   * Creates the endpoint with the /employees URL and an EmployeeAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, workspaceApiUrl('/employees'), new EmployeeAssembler());
  }

  /**
   * Registers an employee (POST /employees). The API creates it ACTIVE with its first job assignment.
   *
   * @param employee - The employee to register.
   * @returns An observable with the registered employee
   * @author Oscar Lizandro Vasquez Llave
   */
  override create(employee: Employee): Observable<Employee> {
    return this.http.post<EmployeeResource>(this.endpointUrl, this.assembler.toRegisterRequestFromEntity(employee)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to register employee'))
    );
  }

  /**
   * Updates the personal data of an employee (PUT /employees/{id}).
   *
   * @param employee - The employee with the new personal data.
   * @param id       - The identifier of the employee.
   * @returns An observable with the updated employee
   * @author Oscar Lizandro Vasquez Llave
   */
  override update(employee: Employee, id: number): Observable<Employee> {
    return this.http.put<EmployeeResource>(`${this.endpointUrl}/${id}`, this.assembler.toUpdatePersonalDataRequestFromEntity(employee)).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update employee'))
    );
  }

  /**
   * Assigns the direct manager of an employee.
   *
   * @param id        - The identifier of the employee.
   * @param managerId - The identifier of the manager.
   * @returns An observable with the updated employee
   * @author Oscar Lizandro Vasquez Llave
   */
  assignDirectManager(id: number, managerId: number): Observable<Employee> {
    const request: AssignDirectManagerRequest = {managerId};
    return this.http.put<EmployeeResource>(`${this.endpointUrl}/${id}/direct-manager`, request).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to assign the direct manager'))
    );
  }

  /**
   * Removes the direct manager of an employee. The API answers with the updated employee.
   *
   * @param id - The identifier of the employee.
   * @returns An observable with the updated employee
   * @author Oscar Lizandro Vasquez Llave
   */
  removeDirectManager(id: number): Observable<Employee> {
    return this.http.delete<EmployeeResource>(`${this.endpointUrl}/${id}/direct-manager`).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to remove the direct manager'))
    );
  }

  /**
   * Suspends an ACTIVE employee.
   *
   * @param id - The identifier of the employee.
   * @returns An observable with the updated employee
   * @author Oscar Lizandro Vasquez Llave
   */
  suspend(id: number): Observable<Employee> {
    return this.http.patch<EmployeeResource>(`${this.endpointUrl}/${id}/suspend`, {}).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to suspend the employee'))
    );
  }

  /**
   * Terminates an employee. The API rejects it while the employee has subordinates.
   *
   * @param id              - The identifier of the employee.
   * @param reason          - The termination reason.
   * @param terminationDate - The termination date, 'YYYY-MM-DD'.
   * @returns An observable with the updated employee
   * @author Oscar Lizandro Vasquez Llave
   */
  terminate(id: number, reason: string, terminationDate: string): Observable<Employee> {
    const request: TerminateEmployeeRequest = {reason, terminationDate};
    return this.http.patch<EmployeeResource>(`${this.endpointUrl}/${id}/terminate`, request).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to terminate the employee'))
    );
  }

  /**
   * Reinstates a TERMINATED employee in an area and position.
   *
   * @param id                - The identifier of the employee.
   * @param areaId            - The identifier of the area.
   * @param positionId        - The identifier of the position.
   * @param reinstatementDate - The reinstatement date, 'YYYY-MM-DD'.
   * @returns An observable with the updated employee
   * @author Oscar Lizandro Vasquez Llave
   */
  reinstate(id: number, areaId: number, positionId: number, reinstatementDate: string): Observable<Employee> {
    const request: ReinstateEmployeeRequest = {areaId, positionId, reinstatementDate};
    return this.http.patch<EmployeeResource>(`${this.endpointUrl}/${id}/reinstate`, request).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to reinstate the employee'))
    );
  }
}
