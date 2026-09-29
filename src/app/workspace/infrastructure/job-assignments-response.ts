import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface JobAssignmentResource extends BaseResource {
  id: number;
  employeeId: number;
  areaId: number;
  positionId: number;
  changeType: string;
  startDate: string;
  endDate: string | null;
}

export interface JobAssignmentsResponse extends BaseResponse {
  jobAssignments: JobAssignmentResource[];
}
