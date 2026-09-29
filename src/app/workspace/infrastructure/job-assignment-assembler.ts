import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {AssignmentChangeType, JobAssignment} from '../domain/model/job-assignment.entity';
import {JobAssignmentResource, JobAssignmentsResponse} from './job-assignments-response';

export class JobAssignmentAssembler implements BaseAssembler<JobAssignment, JobAssignmentResource, JobAssignmentsResponse> {

  toEntityFromResource(resource: JobAssignmentResource): JobAssignment {
    return new JobAssignment({
      id: resource.id,
      employeeId: resource.employeeId,
      areaId: resource.areaId,
      positionId: resource.positionId,
      changeType: resource.changeType as AssignmentChangeType,
      startDate: resource.startDate,
      endDate: resource.endDate
    });
  }

  toResourceFromEntity(entity: JobAssignment): JobAssignmentResource {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      areaId: entity.areaId,
      positionId: entity.positionId,
      changeType: entity.changeType,
      startDate: entity.startDate,
      endDate: entity.endDate
    } as JobAssignmentResource;
  }

  toEntitiesFromResponse(response: JobAssignmentsResponse): JobAssignment[] {
    return response.jobAssignments.map(resource => this.toEntityFromResource(resource));
  }
}
