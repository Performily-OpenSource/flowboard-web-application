import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {AssignmentChangeType, JobAssignment} from '../domain/model/job-assignment.entity';
import {JobAssignmentResource, JobAssignmentsResponse} from './job-assignments-response';

/**
 * Assembler that converts between JobAssignmentResource (API) and JobAssignment (domain entity).
 * The API nests job assignments under the employee, so the employee id is given by the caller.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class JobAssignmentAssembler implements BaseAssembler<JobAssignment, JobAssignmentResource, JobAssignmentsResponse> {

  /**
   * Converts a JobAssignmentResource into a JobAssignment entity.
   *
   * @param resource   - The resource returned by the API.
   * @param employeeId - The identifier of the employee that owns the assignment.
   * @returns The corresponding JobAssignment entity
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntityFromResource(resource: JobAssignmentResource, employeeId = 0): JobAssignment {
    return new JobAssignment({
      id: resource.id,
      employeeId,
      areaId: resource.areaId,
      positionId: resource.positionId,
      changeType: resource.changeType as AssignmentChangeType,
      startDate: resource.startDate,
      endDate: resource.endDate
    });
  }

  /**
   * Converts a JobAssignment entity into a JobAssignmentResource.
   *
   * @param entity - The entity to convert.
   * @returns The corresponding JobAssignmentResource
   * @author Oscar Lizandro Vasquez Llave
   */
  toResourceFromEntity(entity: JobAssignment): JobAssignmentResource {
    return {
      id: entity.id,
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
