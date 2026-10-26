import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Value of a request field as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface FieldValueResource {
  /** Key of the field. */
  key: string;
  /** Value entered. */
  value: string;
}

/**
 * Attached file as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface AttachmentResource {
  /** Original name of the file. */
  fileName: string;
  /** MIME type of the file. */
  contentType: string;
  /** Size of the file in bytes. */
  sizeInBytes: number;
  /** Location where the file is stored. */
  storageUrl: string;
}

/**
 * History entry of a request as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestHistoryResource {
  /** Identifier of the entry. */
  id: number;
  /** Status before the change, or null for the submission. */
  previousStatus: string | null;
  /** Status after the change. */
  newStatus: string;
  /** Employee who made the change, or null when the system made it (e.g. the requester was terminated). */
  actorId: number | null;
  /** Comment or reason of the change, or null. */
  comment: string | null;
  /** Date and time of the change, e.g. '2026-10-20T08:45:00'. */
  occurredAt: string;
}

/**
 * Request as returned by the Flowboard Web Service (RequestResource).
 *
 * @remarks The period and the approver come as plain properties, the same contract the mobile app uses.
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestResource extends BaseResource {
  /** Identifier of the request. */
  id: number;
  /** Employee who submitted the request. */
  requesterId: number;
  /** Request type. */
  requestTypeId: number;
  /** Name of the request type. */
  requestTypeName: string;
  /** Current status, e.g. 'IN_PROGRESS'. */
  status: string;
  /** First day in 'yyyy-MM-dd' format, or null when the request has no period. */
  startDate: string | null;
  /** Last day in 'yyyy-MM-dd' format, or null. */
  endDate: string | null;
  /** Start time ('HH:mm') for requests measured in hours, or null. */
  startTime: string | null;
  /** End time ('HH:mm') for requests measured in hours, or null. */
  endTime: string | null;
  /** Requested calendar days, calculated by the web service (0 for hours or no period). */
  requestedDays: number;
  /** Approver type: 'DIRECT_MANAGER' or 'HR_STAFF'. */
  approverType: string;
  /** Identifier of the direct manager, or null when the request goes to Human Resources. */
  approverEmployeeId: number | null;
  /** Submission date and time, e.g. '2026-10-20T08:45:00'. */
  submittedAt: string;
  /** Values of the fields. */
  fieldValues: FieldValueResource[];
  /** Attached files. */
  attachments: AttachmentResource[];
  /** Status changes of the request, oldest first. */
  history: RequestHistoryResource[];
}

/**
 * Response of the API with several requests.
 *
 * @remarks The web service returns a plain array; BaseApiEndpoint accepts both shapes.
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestsResponse extends BaseResponse {
  /** The requests. */
  requests: RequestResource[];
}
