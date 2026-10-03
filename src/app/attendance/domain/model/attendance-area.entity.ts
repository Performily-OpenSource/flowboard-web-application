/**
 * Represents an organizational area used by attendance.
 *
 * @remarks Stores the identifier and display name needed to associate employees and attendance records with an area.
 * @author Dario Avila de la cruz
 */
export class AttendanceArea {
/**
 * Performs the constructor operation.
 *
 * @param id the identifier to look up or delete.
 * @param name the employee name used to build initials.
 * @author Dario Avila de la cruz
 */
  constructor(
    readonly id: number,
    readonly name: string
  ) {}
}
