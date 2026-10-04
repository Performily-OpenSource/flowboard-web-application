import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {AssignmentChangeType, JobAssignment} from '../domain/model/job-assignment.entity';
import {JobAssignmentResource, JobAssignmentsResponse} from './job-assignments-response';

/**
 * Assembler that converts between JobAssignmentResource (API) and JobAssignment (domain entity).
 * The change type is cast to AssignmentChangeType; resolved area and position are not mapped.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class JobAssignmentAssembler implements BaseAssembler<JobAssignment, JobAssignmentResource, JobAssignmentsResponse> {

  /**
   * Converts a JobAssignmentResource into a JobAssignment entity.
   *
   * @param resource - The resource returned by the API.
   * @returns The corresponding JobAssignment entity
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Converts a JobAssignment entity into a JobAssignmentResource to be sent to the API.
   *
   * @param entity - The entity to convert.
   * @returns The corresponding JobAssignmentResource
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Converts a JobAssignmentsResponse into a list of JobAssignment entities.
   *
   * @param response - The response whose 'jobAssignments' array is converted.
   * @returns The list of JobAssignment entities
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntitiesFromResponse(response: JobAssignmentsResponse): JobAssignment[] {
    return response.jobAssignments.map(resource => this.toEntityFromResource(resource));
  }
}
