
/**
 * Read model of an employee as seen by the Request bounded context.
 *
 * @remarks Built by the WorkspaceAcl from the employees, areas and positions of Workspace; it is not persisted.
 * @author Diego Alonso Diaz Villalba
 */
export class Requester {
  private _id: number;
  private _fullName: string;
  private _initials: string;
  private _positionTitle: string;
  private _areaId: number;
  private _areaName: string;
  private _directManagerId: number | null;
  private _active: boolean;
  private _hrStaff: boolean;

  /**
   * Creates a new Requester.
   *
   * @param props - The employee data needed by Request: name, initials, position, area, manager and flags.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(props: {
    id: number;
    fullName: string;
    initials: string;
    positionTitle: string;
    areaId: number;
    areaName: string;
    directManagerId: number | null;
    active: boolean;
    hrStaff: boolean;
  }) {
    this._id = props.id;
    this._fullName = props.fullName;
    this._initials = props.initials;
    this._positionTitle = props.positionTitle;
    this._areaId = props.areaId;
    this._areaName = props.areaName;
    this._directManagerId = props.directManagerId;
    this._active = props.active;
    this._hrStaff = props.hrStaff;
  }

  /** Identifier of the employee in Workspace. */
  get id(): number {
    return this._id;
  }

  /** Full name of the employee. */
  get fullName(): string {
    return this._fullName;
  }

  /** Initials shown in the avatar, e.g. 'LF'. */
  get initials(): string {
    return this._initials;
  }

  /** Title of the employee's position. */
  get positionTitle(): string {
    return this._positionTitle;
  }

  /** Identifier of the employee's area. */
  get areaId(): number {
    return this._areaId;
  }

  /** Name of the employee's area. */
  get areaName(): string {
    return this._areaName;
  }

  /** Identifier of the direct manager, or null when there is none. */
  get directManagerId(): number | null {
    return this._directManagerId;
  }

  /** Whether the employee is active. */
  get active(): boolean {
    return this._active;
  }

  /** Whether the employee is an active member of the Human Resources area. */
  get hrStaff(): boolean {
    return this._hrStaff;
  }
}
