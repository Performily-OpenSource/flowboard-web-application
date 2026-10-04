/**
 * Entity representing an organizational area (department) of the company.
 * Positions and employees reference an area through its id; areas can be deactivated via the active flag.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class Area {
  private _id: number;
  private _name: string;
  private _description: string;
  private _active: boolean;

  /**
   * Creates a new Area.
   *
   * @param props - The area data: id, name, description and active flag.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(props: { id: number; name: string; description: string; active: boolean }) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._active = props.active;
  }

  /** Unique identifier of the area. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Area name. */
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  /** Short description of the area. */
  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  /** Whether the area is active. */
  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }
}
