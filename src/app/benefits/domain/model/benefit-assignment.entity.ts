import {DateRange} from '../../../shared/domain/model/date-range';
import {BenefitDelivery} from './benefit-delivery.entity';
import {BenefitType} from './benefit-type.entity';

/**
 * Lifecycle of an assignment: ASSIGNED, then DELIVERED or CANCELLED.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export type AssignmentStatus = 'ASSIGNED' | 'DELIVERED' | 'CANCELLED';

/**
 * Available assignment statuses, used by the filters of the views.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['ASSIGNED', 'DELIVERED', 'CANCELLED'];

/**
 * Aggregate root that assigns a benefit type to one employee for a validity period. It keeps the
 * invariants: quantity greater than zero, a delivery is registered only once and a cancelled
 * assignment cannot be delivered.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
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

  /**
   * Initializes the assignment and validates that the quantity is greater than zero.
   * @param props Initial values of the instance.
   * @author Salym
   */
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

  /**
   * Creates one assignment per ACTIVE employee of the area, keeping the source area.
   * @param benefitTypeId Identifier of the benefit type.
   * @param areaId Identifier of the area (AreaId of the Shared Kernel).
   * @param activeEmployeeIds Identifiers of the ACTIVE employees of the area.
   * @param validity Validity period of the assignment.
   * @param quantity Assigned quantity, expressed in the unit of the benefit type.
   * @author Salym
   */
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

  /**
   * Registers the delivery of the benefit and changes the status to DELIVERED.
   * @param deliveredOn Date of the delivery (yyyy-MM-dd).
   * @param registeredBy Identifier of the employee that registers the delivery.
   * @param notes Optional notes about the delivery.
   * @author Salym
   */
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

  /**
   * Cancels the assignment; a delivered assignment cannot be cancelled.
   * @author Salym
   */
  cancel(): void {
    if (this.isDelivered()) {
      throw new Error('A delivered assignment cannot be cancelled.');
    }
    this._status = 'CANCELLED';
  }

  /**
   * Determines whether the benefit was already delivered.
   * @author Salym
   */
  isDelivered(): boolean {
    return this._delivery !== null;
  }

  /**
   * Determines whether the assignment was cancelled.
   * @author Salym
   */
  isCancelled(): boolean {
    return this._status === 'CANCELLED';
  }

  /**
   * Determines whether the assignment is valid on a date.
   * @param date Date to check (yyyy-MM-dd).
   * @author Salym
   */
  isValidOn(date: string): boolean {
    return this._validity.contains(date);
  }

  /**
   * Determines whether this assignment overlaps a new one for the same employee and benefit type.
   * Cancelled assignments do not count.
   * @param benefitTypeId Identifier of the benefit type.
   * @param employeeId Identifier of the employee (EmployeeId of the Shared Kernel).
   * @param validity Validity period of the new assignment.
   * @author Salym
   */
  conflictsWith(benefitTypeId: number, employeeId: number, validity: DateRange): boolean {
    return !this.isCancelled() &&
      this._benefitTypeId === benefitTypeId &&
      this._employeeId === employeeId &&
      this._validity.overlaps(validity);
  }
}
