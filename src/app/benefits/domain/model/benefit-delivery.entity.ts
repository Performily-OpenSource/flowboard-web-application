/**
 * Entity inside the BenefitAssignment aggregate that records that the benefit was handed over to
 * the employee.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitDelivery {
  private _id: number;
  private _deliveredOn: string;
  private _registeredBy: number | null;
  private _notes: string;

  /**
   * Initializes the delivery with its date, author and notes.
   * @param props Initial values of the instance.
   * @remarks The author is optional in the web service until IAM exists, so it can be null.
   * @author Salym
   */
  constructor(props: { id: number; deliveredOn: string; registeredBy: number | null; notes: string }) {
    this._id = props.id;
    this._deliveredOn = props.deliveredOn;
    this._registeredBy = props.registeredBy;
    this._notes = props.notes;
  }

  get id(): number {
    return this._id;
  }

  get deliveredOn(): string {
    return this._deliveredOn;
  }

  get registeredBy(): number | null {
    return this._registeredBy;
  }

  get notes(): string {
    return this._notes;
  }
}
