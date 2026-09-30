/** Entity inside the BenefitAssignment aggregate: records that the benefit was handed over. */
export class BenefitDelivery {
  private _id: number;
  private _deliveredOn: string;
  private _registeredBy: number;
  private _notes: string;

  constructor(props: { id: number; deliveredOn: string; registeredBy: number; notes: string }) {
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

  get registeredBy(): number {
    return this._registeredBy;
  }

  get notes(): string {
    return this._notes;
  }
}
