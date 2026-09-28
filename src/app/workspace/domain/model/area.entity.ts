export class Area {
  private _id: number;
  private _name: string;
  private _description: string;
  private _active: boolean;

  constructor(props: { id: number; name: string; description: string; active: boolean }) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._active = props.active;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }
}
