import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ApproverType, Request, RequestStatus} from '../domain/model/request.entity';
import {RequestHistory} from '../domain/model/request-history.entity';
import {RequestResource, RequestsResponse} from './requests-response';


/**
 * Converts between the Request entity and the resource returned by the API.
 *
 * @remarks The period of the entity is grouped in the 'period' object of the resource, and the approver in 'approver'.
 * @author Diego Alonso Diaz Villalba
 */
export class RequestAssembler implements BaseAssembler<Request, RequestResource, RequestsResponse> {

  /**
   * Converts a resource to a Request entity, including its history.
   *
   * @param resource - The request resource.
   * @returns The Request entity
   * @author Diego Alonso Diaz Villalba
   */
  toEntityFromResource(resource: RequestResource): Request {
    return new Request({
      id: resource.id,
      requesterId: resource.requesterId,
      requestTypeId: resource.requestTypeId,
      startDate: resource.period?.startDate ?? null,
      endDate: resource.period?.endDate ?? null,
      startTime: resource.period?.startTime ?? null,
      endTime: resource.period?.endTime ?? null,
      fieldValues: (resource.fieldValues ?? []).map(value => ({ key: value.key, value: value.value ?? '' })),
      attachments: (resource.attachments ?? []).map(file => ({ ...file })),
      approverType: resource.approver.type as ApproverType,
      approverId: resource.approver.employeeId,
      status: resource.status as RequestStatus,
      submittedAt: resource.submittedAt,
      history: (resource.history ?? []).map(entry => new RequestHistory({
        id: entry.id,
        previousStatus: entry.previousStatus as RequestStatus | null,
        newStatus: entry.newStatus as RequestStatus,
        actorId: entry.actorId,
        comment: entry.comment,
        occurredAt: entry.occurredAt
      }))
    });
  }

  /**
   * Converts a Request entity to a resource.
   *
   * @param entity - The Request entity.
   * @returns The request resource; the period is null when the request has no start date
   * @author Diego Alonso Diaz Villalba
   */
  toResourceFromEntity(entity: Request): RequestResource {
    return {
      id: entity.id,
      requesterId: entity.requesterId,
      requestTypeId: entity.requestTypeId,
      period: entity.startDate ? {
        startDate: entity.startDate,
        endDate: entity.endDate ?? entity.startDate,
        startTime: entity.startTime,
        endTime: entity.endTime
      } : null,
      fieldValues: entity.fieldValues.map(value => ({ key: value.key, value: value.value })),
      attachments: entity.attachments.map(file => ({ ...file })),
      approver: { type: entity.approverType, employeeId: entity.approverId },
      status: entity.status,
      submittedAt: entity.submittedAt,
      history: entity.history.map(entry => ({
        id: entry.id,
        previousStatus: entry.previousStatus,
        newStatus: entry.newStatus,
        actorId: entry.actorId,
        comment: entry.comment,
        occurredAt: entry.occurredAt
      }))
    };
  }

  /**
   * Converts a response with several requests to entities.
   *
   * @param response - The requests response.
   * @returns The Request entities
   * @author Diego Alonso Diaz Villalba
   */
  toEntitiesFromResponse(response: RequestsResponse): Request[] {
    return response.requests.map(resource => this.toEntityFromResource(resource));
  }
}
