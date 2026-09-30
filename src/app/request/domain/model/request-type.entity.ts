import {RequestField} from './request-field.entity';

export type BalanceDeduction = 'NONE' | 'VACATION_DAYS' | 'BENEFIT_BALANCE';

export const BALANCE_DEDUCTIONS: BalanceDeduction[] = ['NONE', 'VACATION_DAYS', 'BENEFIT_BALANCE'];

export class RequestType {
  private _id: number;
  private _name: string;
  private _description: string;
  private _requiresAttachment: boolean;
  private _balanceDeduction: BalanceDeduction;
  private _active: boolean;
  private _fields: RequestField[];

  constructor(props: {
    id: number;
    name: string;
    description: string;
    requiresAttachment: boolean;
    balanceDeduction: BalanceDeduction;
    active: boolean;
    fields?: RequestField[];
  }) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._requiresAttachment = props.requiresAttachment;
    this._balanceDeduction = props.balanceDeduction;
    this._active = props.active;
    this._fields = props.fields ?? [];
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

  get requiresAttachment(): boolean {
    return this._requiresAttachment;
  }

  set requiresAttachment(value: boolean) {
    this._requiresAttachment = value;
  }

  get balanceDeduction(): BalanceDeduction {
    return this._balanceDeduction;
  }

  set balanceDeduction(value: BalanceDeduction) {
    this._balanceDeduction = value;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  get fields(): RequestField[] {
    return [...this._fields].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  set fields(value: RequestField[]) {
    this._fields = value;
  }

  deductsBalance(): boolean {
    return this._balanceDeduction !== 'NONE';
  }

  deductsVacationDays(): boolean {
    return this._balanceDeduction === 'VACATION_DAYS';
  }

  hasPeriod(): boolean {
    return this._fields.some(field => field.key === 'startDate');
  }
  
  isMeasuredInHours(): boolean {
    return this._fields.some(field => field.key === 'startTime');
  }
}
