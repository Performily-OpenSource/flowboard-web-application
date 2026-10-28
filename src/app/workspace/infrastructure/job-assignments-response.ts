import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of a job assignment returned by the API (JobAssignmentResponse). */
export interface JobAssignmentResource extends BaseResource {
  id: number;
  areaId: number;
  areaName?: string;
  positionId: number;
  positionTitle?: string;
  changeType: string;
  startDate: string;
  endDate: string | null;
  current?: boolean;
}

/** Payload of POST /employees/{id}/job-assignments (AssignJobRequest). */
export interface AssignJobRequest {
  areaId: number;
  positionId: number;
  effectiveDate: string;
}

/** Response wrapper kept for the BaseAssembler contract; the API returns a plain array. */
export interface JobAssignmentsResponse extends BaseResponse {
  jobAssignments: JobAssignmentResource[];
}
