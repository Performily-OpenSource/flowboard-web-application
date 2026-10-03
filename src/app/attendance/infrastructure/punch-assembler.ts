import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Punch} from '../domain/model/punch.entity';
import {PunchType} from '../domain/model/attendance-record.entity';
import {PunchResource, PunchesResponse} from './punches-response';

/**
 * Converts punch API resources to and from the Punch domain entity.
 *
 * @remarks Keeps transport mapping separate from punch domain behavior.
 * @author Dario Avila de la cruz
 */
export class PunchAssembler implements BaseAssembler<Punch, PunchResource, PunchesResponse> {
/**
 * Converts an API resource into its corresponding domain entity.
 *
 * @param resource the API resource to convert.
 * @returns The corresponding domain entity.
 * @author Dario Avila de la cruz
 */
  toEntityFromResource(resource: PunchResource): Punch { return new Punch({id:resource.id,employeeId:resource.employeeId,attendanceRecordId:resource.attendanceRecordId,punchedAt:resource.punchedAt,type:resource.type as PunchType}); }
/**
 * Converts a domain entity into its API resource representation.
 *
 * @param entity the domain entity to convert.
 * @returns The corresponding API resource.
 * @author Dario Avila de la cruz
 */
  toResourceFromEntity(entity: Punch): PunchResource { return {id:entity.id,employeeId:entity.employeeId,attendanceRecordId:entity.attendanceRecordId,punchedAt:entity.punchedAt,type:entity.type}; }
/**
 * Converts all resources in an API response into domain entities.
 *
 * @param response the API response to convert.
 * @returns The domain entities represented by the response.
 * @author Dario Avila de la cruz
 */
  toEntitiesFromResponse(response: PunchesResponse): Punch[] { return response.punches.map(resource=>this.toEntityFromResource(resource)); }
}
