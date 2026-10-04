import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Period of a request as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestPeriodResource {
  /** First day, in 'yyyy-MM-dd' format. */
  startDate: string;
  /** Last day, in 'yyyy-MM-dd' format. */
  endDate: string;
  /** Start time for requests measured in hours, or null. */
  startTime: string | null;
  /** End time for requests measured in hours, or null. */
  endTime: string | null;
}

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
 * Approver of a request as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface ApproverResource {
  /** Approver type: 'DIRECT_MANAGER' or 'HR_STAFF'. */
  type: string;
  /** Identifier of the direct manager, or null for Human Resources. */
  employeeId: number | null;
}

/**
 * History entry of a request as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestHistoryResource {
  /** Identifier of the entry. */
  id: number;
  /** Status before the change, or null. */
  previousStatus: string | null;
  /** Status after the change. */
  newStatus: string;
  /** Employee who made the change. */
  actorId: number;
  /** Comment of the change, or null. */
  comment: string | null;
  /** Date and time of the change in ISO format. */
  occurredAt: string;
}

/**
 * Request as returned by the API.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestResource extends BaseResource {
  /** Identifier of the request. */
  id: number;
  /** Employee who submitted the request. */
  requesterId: number;
  /** Request type. */
  requestTypeId: number;
  /** Period of the request, or null when it has none. */
  period: RequestPeriodResource | null;
  /** Values of the fields. */
  fieldValues: FieldValueResource[];
  /** Attached files. */
  attachments: AttachmentResource[];
  /** Who must resolve the request. */
  approver: ApproverResource;
  /** Current status, e.g. 'IN_PROGRESS'. */
  status: string;
  /** Submission date in ISO format. */
  submittedAt: string;
  /** Status changes of the request. */
  history: RequestHistoryResource[];
}

/**
 * Response of the API with several requests.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestsResponse extends BaseResponse {
  /** The requests. */
  requests: RequestResource[];
}
