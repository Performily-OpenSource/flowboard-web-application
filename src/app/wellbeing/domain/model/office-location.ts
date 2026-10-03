/**
 * Properties required to create an office location.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface OfficeLocationProps { building: string; floor: string; reference?: string; }
/**
 * Represents the physical location of a workspace.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class OfficeLocation {
  readonly building: string; readonly floor: string; readonly reference: string;
/**
 * Initializes the instance with the data required for operation.
 * @param props Parameter used by the operation.
 * @author Diana Li
 */
  constructor(props: OfficeLocationProps) {
    const building = props.building.trim(); const floor = props.floor.trim(); const reference = (props.reference ?? '').trim();
    if (!building || !floor) throw new Error('Building and floor are required.');
    if (reference.length > 150) throw new Error('The location reference is too long.');
    this.building=building; this.floor=floor; this.reference=reference;
  }
}
