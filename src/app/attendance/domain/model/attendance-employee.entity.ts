/**
 * Represents the employee information consumed by the Attendance bounded context.
 *
 * @remarks Stores the employee identity together with the area and position needed for attendance calculations and filtering.
 * @author Dario Avila de la cruz
 */
export class AttendanceEmployee {
/**
 * Performs the constructor operation.
 *
 * @param id the identifier to look up or delete.
 * @param fullName the value used by the operation.
 * @param areaId the value used by the operation.
 * @param positionId the value used by the operation.
 * @author Dario Avila de la cruz
 */
  constructor(
    readonly id: number,
    readonly fullName: string,
    readonly areaId: number,
    readonly positionId: number
  ) {}
}
