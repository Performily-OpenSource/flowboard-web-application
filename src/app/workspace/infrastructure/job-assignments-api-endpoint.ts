import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {JobAssignment} from '../domain/model/job-assignment.entity';
import {JobAssignmentResource, JobAssignmentsResponse} from './job-assignments-response';
import {JobAssignmentAssembler} from './job-assignment-assembler';
import {catchError, map, Observable} from 'rxjs';

export class JobAssignmentsApiEndpoint extends BaseApiEndpoint<JobAssignment, JobAssignmentResource, JobAssignmentsResponse, JobAssignmentAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderJobAssignmentsEndpointPath}`, new JobAssignmentAssembler());
  }

  getByEmployeeId(employeeId: number): Observable<JobAssignment[]> {
    return this.http.get<JobAssignmentResource[]>(`${this.endpointUrl}?employeeId=${employeeId}`).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to get job assignments'))
    );
  }
}
