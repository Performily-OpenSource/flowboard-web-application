export type BenefitUnit = 'MONEY' | 'DAYS' | 'UNITS';
export type BenefitPeriodicity = 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL';

export const BENEFIT_UNITS: BenefitUnit[] = ['MONEY', 'DAYS', 'UNITS'];
export const BENEFIT_PERIODICITIES: BenefitPeriodicity[] = ['MONTHLY', 'SEMIANNUAL', 'ANNUAL'];

/**
 * Entity of the benefits catalog. The name is unique inside the organization
 * (checked by the store because it needs the whole catalog).
 */
export class BenefitType {
  private _id: number;
  private _name: string;
  private _description: string;
  private _hasBalance: boolean;
  private _unit: BenefitUnit;
  private _periodicity: BenefitPeriodicity;
  private _active: boolean;

  constructor(props: {
    id: number;
    name: string;
    description: string;
    hasBalance: boolean;
    unit: BenefitUnit;
    periodicity: BenefitPeriodicity;
    active: boolean;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._hasBalance = props.hasBalance;
    this._unit = props.unit;
    this._periodicity = props.periodicity;
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

  get hasBalance(): boolean {
    return this._hasBalance;
  }

  set hasBalance(value: boolean) {
    this._hasBalance = value;
  }

  get unit(): BenefitUnit {
    return this._unit;
  }

  set unit(value: BenefitUnit) {
    this._unit = value;
  }

  get periodicity(): BenefitPeriodicity {
    return this._periodicity;
  }

  set periodicity(value: BenefitPeriodicity) {
    this._periodicity = value;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  activate(): void {
    this._active = true;
  }

  deactivate(): void {
    this._active = false;
  }

  hasSameName(name: string): boolean {
    return this._name.trim().toLowerCase() === name.trim().toLowerCase();
  }
}
