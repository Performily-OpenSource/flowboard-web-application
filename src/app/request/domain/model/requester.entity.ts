/**
 * Employee as the Request bounded context shows it (requester or approver).
 * It is built by the WorkspaceAcl from the Workspace employees, areas and positions.
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

  get id(): number {
    return this._id;
  }

  get fullName(): string {
    return this._fullName;
  }

  get initials(): string {
    return this._initials;
  }

  get positionTitle(): string {
    return this._positionTitle;
  }

  get areaId(): number {
    return this._areaId;
  }

  get areaName(): string {
    return this._areaName;
  }

  get directManagerId(): number | null {
    return this._directManagerId;
  }

  get active(): boolean {
    return this._active;
  }

  /** Belongs to Human Resources, so it attends the requests routed to HR. */
  get hrStaff(): boolean {
    return this._hrStaff;
  }
}
