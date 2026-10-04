import {Area} from './area.entity';

/**
 * Entity representing a position (job title) defined within an area.
 * Each position belongs to exactly one area and carries a reference salary (amount and currency).
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class Position {
  private _id: number;
  private _title: string;
  private _areaId: number;
  private _referenceSalaryAmount: number;
  private _referenceSalaryCurrency: string;
  private _active: boolean;
  private _area: Area | null;

  /**
   * Creates a new Position.
   *
   * @param props - The position data: id, title, owning areaId, reference salary amount and currency,
   *                active flag and an optional resolved area (defaults to null).
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(props: {
    id: number;
    title: string;
    areaId: number;
    referenceSalaryAmount: number;
    referenceSalaryCurrency: string;
    active: boolean;
    area?: Area | null;
  }) {
    this._id = props.id;
    this._title = props.title;
    this._areaId = props.areaId;
    this._referenceSalaryAmount = props.referenceSalaryAmount;
    this._referenceSalaryCurrency = props.referenceSalaryCurrency;
    this._active = props.active;
    this._area = props.area ?? null;
  }

  /** Unique identifier of the position. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Position title. */
  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  /** Identifier of the area this position belongs to. */
  get areaId(): number {
    return this._areaId;
  }

  set areaId(value: number) {
    this._areaId = value;
  }

  /** Reference salary amount for the position. */
  get referenceSalaryAmount(): number {
    return this._referenceSalaryAmount;
  }

  set referenceSalaryAmount(value: number) {
    this._referenceSalaryAmount = value;
  }

  /** Currency code of the reference salary. */
  get referenceSalaryCurrency(): string {
    return this._referenceSalaryCurrency;
  }

  set referenceSalaryCurrency(value: string) {
    this._referenceSalaryCurrency = value;
  }

  /** Whether the position is active. */
  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  /** Resolved area this position belongs to, or null if not loaded. */
  get area(): Area | null {
    return this._area;
  }

  set area(value: Area | null) {
    this._area = value;
  }

  /**
   * Checks whether this position belongs to the given area.
   *
   * @param areaId - The identifier of the area to compare with.
   * @returns True if the position's areaId equals the given id, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  belongsTo(areaId: number): boolean {
    return this._areaId === areaId;
  }
}
