import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface RequestPeriodResource {
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
}

export interface FieldValueResource {
  key: string;
  value: string;
}

export interface AttachmentResource {
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  storageUrl: string;
}

export interface ApproverResource {
  type: string;
  employeeId: number | null;
}

export interface RequestHistoryResource {
  id: number;
  previousStatus: string | null;
  newStatus: string;
  actorId: number;
  comment: string | null;
  occurredAt: string;
}

export interface RequestResource extends BaseResource {
  id: number;
  requesterId: number;
  requestTypeId: number;
  period: RequestPeriodResource | null;
  fieldValues: FieldValueResource[];
  attachments: AttachmentResource[];
  approver: ApproverResource;
  status: string;
  submittedAt: string;
  history: RequestHistoryResource[];
}

export interface RequestsResponse extends BaseResponse {
  requests: RequestResource[];
}
