import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {JobAssignment} from '../domain/model/job-assignment.entity';
import {JobAssignmentResource, JobAssignmentsResponse} from './job-assignments-response';
import {JobAssignmentAssembler} from './job-assignment-assembler';
import {catchError, map, Observable} from 'rxjs';

/**
 * API endpoint for the JobAssignment resource, targeting the '/job-assignments' REST collection
 * (platformProviderApiBaseUrl + /job-assignments). Inherits CRUD operations from BaseApiEndpoint.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class JobAssignmentsApiEndpoint extends BaseApiEndpoint<JobAssignment, JobAssignmentResource, JobAssignmentsResponse, JobAssignmentAssembler> {

  /**
   * Creates the endpoint with the /job-assignments URL and a JobAssignmentAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderJobAssignmentsEndpointPath}`, new JobAssignmentAssembler());
  }

  /**
   * Retrieves the job assignments of an employee (GET /job-assignments?employeeId={employeeId}).
   *
   * @param employeeId - The identifier of the employee.
   * @returns An observable with the employee's job assignments; errors with 'Failed to get job assignments' on failure
   * @author Oscar Lizandro Vasquez Llave
   */
  getByEmployeeId(employeeId: number): Observable<JobAssignment[]> {
    return this.http.get<JobAssignmentResource[]>(`${this.endpointUrl}?employeeId=${employeeId}`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to get job assignments'))
    );
  }
}
