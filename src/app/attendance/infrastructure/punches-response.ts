import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Defines the transport representation of an attendance punch.
 *
 * @remarks Describes the punch fields exchanged with the platform attendance API.
 * @author Dario Avila de la cruz
 */
export interface PunchResource extends BaseResource {
  id: number; employeeId: number; attendanceRecordId: number; punchedAt: string; type: string;
}
/**
 * Defines the transport response containing attendance punches.
 *
 * @remarks Wraps punch resources returned by the platform API.
 * @author Dario Avila de la cruz
 */
export interface PunchesResponse extends BaseResponse { punches: PunchResource[]; }
