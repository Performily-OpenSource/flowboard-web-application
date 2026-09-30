import {DateRange} from '../../../shared/domain/model/date-range';
import {BenefitDelivery} from './benefit-delivery.entity';
import {BenefitType} from './benefit-type.entity';

export type AssignmentStatus = 'ASSIGNED' | 'DELIVERED' | 'CANCELLED';

export const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['ASSIGNED', 'DELIVERED', 'CANCELLED'];

/**
 * Aggregate root: a benefit type assigned to one employee for a validity period.
 * Invariants kept here: quantity > 0, a delivery is registered only once,
 * and a cancelled assignment cannot be delivered.
 */
export class BenefitAssignment {
  private _id: number;
  private _benefitTypeId: number;
  private _employeeId: number;
  private _sourceAreaId: number | null;
  private _validity: DateRange;
  private _quantity: number;
  private _status: AssignmentStatus;
  private _delivery: BenefitDelivery | null;
  private _benefitType: BenefitType | null;

  constructor(props: {
    id: number;
    benefitTypeId: number;
    employeeId: number;
    sourceAreaId?: number | null;
    validity: DateRange;
    quantity: number;
    status?: AssignmentStatus;
    delivery?: BenefitDelivery | null;
    benefitType?: BenefitType | null;
  }) {
    if (!(props.quantity > 0)) {
      throw new Error('The benefit quantity must be greater than zero.');
    }
    this._id = props.id;
    this._benefitTypeId = props.benefitTypeId;
    this._employeeId = props.employeeId;
    this._sourceAreaId = props.sourceAreaId ?? null;
    this._validity = props.validity;
    this._quantity = Math.round(props.quantity * 100) / 100;
    this._status = props.status ?? 'ASSIGNED';
    this._delivery = props.delivery ?? null;
    this._benefitType = props.benefitType ?? null;
  }

  /** Creates one assignment per ACTIVE employee of the area, keeping the source area. */
  static forArea(benefitTypeId: number, areaId: number, activeEmployeeIds: number[],
                 validity: DateRange, quantity: number): BenefitAssignment[] {
    return activeEmployeeIds.map(employeeId => new BenefitAssignment({
      id: 0,
      benefitTypeId,
      employeeId,
      sourceAreaId: areaId,
      validity,
      quantity
    }));
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get benefitTypeId(): number {
    return this._benefitTypeId;
  }

  get employeeId(): number {
    return this._employeeId;
  }

  get sourceAreaId(): number | null {
    return this._sourceAreaId;
  }

  get validity(): DateRange {
    return this._validity;
  }

  get quantity(): number {
    return this._quantity;
  }

  get status(): AssignmentStatus {
    return this._status;
  }

  get delivery(): BenefitDelivery | null {
    return this._delivery;
  }

  get benefitType(): BenefitType | null {
    return this._benefitType;
  }

  set benefitType(value: BenefitType | null) {
    this._benefitType = value;
  }

  registerDelivery(deliveredOn: string, registeredBy: number, notes: string): void {
    if (this.isDelivered()) {
      throw new Error('This assignment was already delivered.');
    }
    if (this.isCancelled()) {
      throw new Error('A cancelled assignment cannot be delivered.');
    }
    this._delivery = new BenefitDelivery({ id: Date.now(), deliveredOn, registeredBy, notes });
    this._status = 'DELIVERED';
  }

  cancel(): void {
    if (this.isDelivered()) {
      throw new Error('A delivered assignment cannot be cancelled.');
    }
    this._status = 'CANCELLED';
  }

  isDelivered(): boolean {
    return this._delivery !== null;
  }

  isCancelled(): boolean {
    return this._status === 'CANCELLED';
  }

  isValidOn(date: string): boolean {
    return this._validity.contains(date);
  }

  /** Same employee, same benefit type and overlapping validity (cancelled ones do not count). */
  conflictsWith(benefitTypeId: number, employeeId: number, validity: DateRange): boolean {
    return !this.isCancelled() &&
      this._benefitTypeId === benefitTypeId &&
      this._employeeId === employeeId &&
      this._validity.overlaps(validity);
  }
}
