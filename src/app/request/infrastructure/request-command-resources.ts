import {AttachmentResource, FieldValueResource} from './requests-response';

/**
 * Body of POST /requests: submits a new request (SubmitRequestResource of the web service).
 *
 * @remarks Until IAM exists the requester is sent by the client; then it will come from the token.
 * @author Diego Alonso Diaz Villalba
 */
export interface SubmitRequestResource {
  requesterId: number;
  requestTypeId: number;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  fieldValues: FieldValueResource[];
  attachments: AttachmentResource[];
}

/**
 * Body of POST /requests/{id}/resubmit: sends again a request returned for review (ResubmitRequestResource).
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface ResubmitRequestResource {
  actorId: number;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  fieldValues: FieldValueResource[];
  attachments: AttachmentResource[];
  comment: string | null;
}

/**
 * Body of the approve, reject, return-for-review and cancel actions (ResolveRequestResource).
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface ResolveRequestResource {
  actorId: number;
  comment: string | null;
}
