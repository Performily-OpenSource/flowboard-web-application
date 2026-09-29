import {Area} from './area.entity';

export class Position {
  private _id: number;
  private _title: string;
  private _areaId: number;
  private _referenceSalaryAmount: number;
  private _referenceSalaryCurrency: string;
  private _active: boolean;
  private _area: Area | null;

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

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get areaId(): number {
    return this._areaId;
  }

  set areaId(value: number) {
    this._areaId = value;
  }

  get referenceSalaryAmount(): number {
    return this._referenceSalaryAmount;
  }

  set referenceSalaryAmount(value: number) {
    this._referenceSalaryAmount = value;
  }

  get referenceSalaryCurrency(): string {
    return this._referenceSalaryCurrency;
  }

  set referenceSalaryCurrency(value: string) {
    this._referenceSalaryCurrency = value;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  get area(): Area | null {
    return this._area;
  }

  set area(value: Area | null) {
    this._area = value;
  }

  belongsTo(areaId: number): boolean {
    return this._areaId === areaId;
  }
}
