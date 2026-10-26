import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ApproverType, Request, RequestStatus} from '../domain/model/request.entity';
import {RequestHistory} from '../domain/model/request-history.entity';
import {RequestResource, RequestsResponse} from './requests-response';


/**
 * Converts between the Request entity and the resource returned by the Flowboard Web Service.
 *
 * @remarks The web service sends the period and the approver as plain properties
 * (startDate, endDate, startTime, endTime, approverType, approverEmployeeId) and calculates
 * the requested days, so the entity uses that value instead of counting them again.
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
      startDate: resource.startDate,
      endDate: resource.endDate,
      startTime: this.toShortTime(resource.startTime),
      endTime: this.toShortTime(resource.endTime),
      requestedDays: resource.requestedDays,
      fieldValues: (resource.fieldValues ?? []).map(value => ({ key: value.key, value: value.value ?? '' })),
      attachments: (resource.attachments ?? []).map(file => ({ ...file })),
      approverType: resource.approverType as ApproverType,
      approverId: resource.approverEmployeeId,
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
   * Converts a Request entity to a resource with the shape of the web service.
   *
   * @param entity - The Request entity.
   * @returns The request resource
   * @author Diego Alonso Diaz Villalba
   */
  toResourceFromEntity(entity: Request): RequestResource {
    return {
      id: entity.id,
      requesterId: entity.requesterId,
      requestTypeId: entity.requestTypeId,
      requestTypeName: entity.requestType?.name ?? '',
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      startTime: entity.startTime,
      endTime: entity.endTime,
      requestedDays: entity.requestedDays(),
      approverType: entity.approverType,
      approverEmployeeId: entity.approverId,
      submittedAt: entity.submittedAt,
      fieldValues: entity.fieldValues.map(value => ({ key: value.key, value: value.value })),
      attachments: entity.attachments.map(file => ({ ...file })),
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

  /**
   * Keeps only hours and minutes of a time ('09:00:00' becomes '09:00'), the format the form and the pipes use.
   *
   * @param time - The time sent by the web service, or null.
   * @returns The time in 'HH:mm' format, or null
   * @author Diego Alonso Diaz Villalba
   */
  private toShortTime(time: string | null): string | null {
    return time ? time.substring(0, 5) : null;
  }
}
