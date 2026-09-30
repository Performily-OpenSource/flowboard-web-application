import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Punch} from '../domain/model/punch.entity';
import {PunchType} from '../domain/model/attendance-record.entity';
import {PunchResource, PunchesResponse} from './punches-response';

export class PunchAssembler implements BaseAssembler<Punch, PunchResource, PunchesResponse> {
  toEntityFromResource(resource: PunchResource): Punch { return new Punch({id:resource.id,employeeId:resource.employeeId,attendanceRecordId:resource.attendanceRecordId,punchedAt:resource.punchedAt,type:resource.type as PunchType}); }
  toResourceFromEntity(entity: Punch): PunchResource { return {id:entity.id,employeeId:entity.employeeId,attendanceRecordId:entity.attendanceRecordId,punchedAt:entity.punchedAt,type:entity.type}; }
  toEntitiesFromResponse(response: PunchesResponse): Punch[] { return response.punches.map(resource=>this.toEntityFromResource(resource)); }
}
