export interface OfficeLocationProps { building: string; floor: string; reference?: string; }
export class OfficeLocation {
  readonly building: string; readonly floor: string; readonly reference: string;
  constructor(props: OfficeLocationProps) {
    const building = props.building.trim(); const floor = props.floor.trim(); const reference = (props.reference ?? '').trim();
    if (!building || !floor) throw new Error('Building and floor are required.');
    if (reference.length > 150) throw new Error('The location reference is too long.');
    this.building=building; this.floor=floor; this.reference=reference;
  }
}
