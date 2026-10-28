import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {JobAssignment} from '../domain/model/job-assignment.entity';
import {AssignJobRequest, JobAssignmentResource, JobAssignmentsResponse} from './job-assignments-response';
import {JobAssignmentAssembler} from './job-assignment-assembler';
import {WorkspaceApiEndpoint, workspaceApiUrl} from './workspace-api-endpoint';

/**
 * API endpoint for the job assignments of an employee, targeting
 * GET/POST /api/v1/employees/{employeeId}/job-assignments of the flowboard-web-service.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class JobAssignmentsApiEndpoint extends WorkspaceApiEndpoint<JobAssignment, JobAssignmentResource, JobAssignmentsResponse, JobAssignmentAssembler> {

  /**
   * Creates the endpoint with the /employees URL and a JobAssignmentAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, workspaceApiUrl('/employees'), new JobAssignmentAssembler());
  }

  /**
   * Retrieves the job history of an employee.
   *
   * @param employeeId - The identifier of the employee.
   * @returns An observable with the job assignments
   * @author Oscar Lizandro Vasquez Llave
   */
  getByEmployeeId(employeeId: number): Observable<JobAssignment[]> {
    return this.http.get<JobAssignmentResource[]>(`${this.endpointUrl}/${employeeId}/job-assignments`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource, employeeId))),
      catchError(this.handleError('Failed to get job assignments'))
    );
  }

  /**
   * Changes the area or position of an employee. The API closes the current assignment and opens a new one.
   *
   * @param employeeId    - The identifier of the employee.
   * @param areaId        - The identifier of the new area.
   * @param positionId    - The identifier of the new position.
   * @param effectiveDate - The date the change takes effect, 'YYYY-MM-DD'.
   * @returns An observable with the new job assignment
   * @author Oscar Lizandro Vasquez Llave
   */
  assign(employeeId: number, areaId: number, positionId: number, effectiveDate: string): Observable<JobAssignment> {
    const request: AssignJobRequest = {areaId, positionId, effectiveDate};
    return this.http.post<JobAssignmentResource>(`${this.endpointUrl}/${employeeId}/job-assignments`, request).pipe(
      map(created => this.assembler.toEntityFromResource(created, employeeId)),
      catchError(this.handleError('Failed to change the job assignment'))
    );
  }
}
