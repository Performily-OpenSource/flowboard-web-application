import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/** Resource representing the JSON shape of a job assignment returned by the API. */
export interface JobAssignmentResource extends BaseResource {
  id: number;
  /** Identifier of the employee the assignment belongs to. */
  employeeId: number;
  areaId: number;
  positionId: number;
  /** Assignment change type ('HIRE', 'REASSIGNMENT' or 'REINSTATEMENT'). */
  changeType: string;
  /** Start date as a 'YYYY-MM-DD' string. */
  startDate: string;
  /** End date as a 'YYYY-MM-DD' string, or null while current. */
  endDate: string | null;
}

/** Response wrapper returned by the API when the job assignments are listed inside a 'jobAssignments' property. */
export interface JobAssignmentsResponse extends BaseResponse {
  jobAssignments: JobAssignmentResource[];
}
