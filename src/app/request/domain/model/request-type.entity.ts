import {RequestField} from './request-field.entity';

/** Balance that an approved request of this type deducts from the employee. */
export type BalanceDeduction = 'NONE' | 'VACATION_DAYS' | 'BENEFIT_BALANCE';

/** All supported balance deductions, e.g. for select options. */
export const BALANCE_DEDUCTIONS: BalanceDeduction[] = ['NONE', 'VACATION_DAYS', 'BENEFIT_BALANCE'];

/**
 * Type of request configured by Human Resources (US27, US28), such as vacations or permissions.
 * Defines the fields the employee fills in, whether an attachment is required and which balance it deducts.
 *
 * @author Diego Alonso Diaz Villalba
 */
export class RequestType {
  private _id: number;
  private _name: string;
  private _description: string;
  private _requiresAttachment: boolean;
  private _balanceDeduction: BalanceDeduction;
  private _active: boolean;
  private _fields: RequestField[];

  /**
   * Creates a new RequestType.
   * The fields default to an empty list.
   *
   * @param props - The type data: identifier, name, description, attachment rule, balance deduction, status and fields.
   * @author Diego Alonso Diaz Villalba
   */
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

  /** Unique identifier of the request type. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Name of the request type, unique among all types. */
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  /** Short description shown to the employee. */
  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  /** Whether a request of this type needs at least one attached file. */
  get requiresAttachment(): boolean {
    return this._requiresAttachment;
  }

  set requiresAttachment(value: boolean) {
    this._requiresAttachment = value;
  }

  /** Balance deducted when a request of this type is approved. */
  get balanceDeduction(): BalanceDeduction {
    return this._balanceDeduction;
  }

  set balanceDeduction(value: BalanceDeduction) {
    this._balanceDeduction = value;
  }

  /** Whether employees can submit requests of this type. */
  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  /** Fields of the type, sorted by display order. */
  get fields(): RequestField[] {
    return [...this._fields].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  set fields(value: RequestField[]) {
    this._fields = value;
  }

  /**
   * Checks whether an approved request of this type deducts any balance.
   *
   * @returns True if the balance deduction is not 'NONE', false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  deductsBalance(): boolean {
    return this._balanceDeduction !== 'NONE';
  }

  /**
   * Checks whether an approved request of this type deducts vacation days.
   *
   * @returns True if the balance deduction is 'VACATION_DAYS', false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  deductsVacationDays(): boolean {
    return this._balanceDeduction === 'VACATION_DAYS';
  }

  /**
   * Checks whether requests of this type have a period.
   *
   * @returns True if the type has a 'startDate' field, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  hasPeriod(): boolean {
    return this._fields.some(field => field.key === 'startDate');
  }
  
  /**
   * Checks whether requests of this type are measured in hours instead of days.
   *
   * @returns True if the type has a 'startTime' field, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isMeasuredInHours(): boolean {
    return this._fields.some(field => field.key === 'startTime');
  }
}
