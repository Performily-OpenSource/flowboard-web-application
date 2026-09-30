export type FieldDataType = 'TEXT' | 'NUMBER' | 'DATE' | 'TIME' | 'MONEY' | 'BOOLEAN';

export const FIELD_DATA_TYPES: FieldDataType[] = ['TEXT', 'NUMBER', 'DATE', 'TIME', 'MONEY', 'BOOLEAN'];

/** Keys that the form uses to build the period of a request (dates and times). */
export const PERIOD_FIELD_KEYS = ['startDate', 'endDate', 'startTime', 'endTime'];

/** Format of a field key: starts with a lowercase letter, then letters or numbers (2 to 50). */
export const FIELD_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{1,49}$/;

export class RequestField {
  private _id: number;
  private _key: string;
  private _label: string;
  private _dataType: FieldDataType;
  private _required: boolean;
  private _displayOrder: number;

  constructor(props: {
    id: number;
    key: string;
    label: string;
    dataType: FieldDataType;
    required: boolean;
    displayOrder: number;
  }) {
    this._id = props.id;
    this._key = props.key;
    this._label = props.label;
    this._dataType = props.dataType;
    this._required = props.required;
    this._displayOrder = props.displayOrder;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get key(): string {
    return this._key;
  }

  set key(value: string) {
    this._key = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get dataType(): FieldDataType {
    return this._dataType;
  }

  set dataType(value: FieldDataType) {
    this._dataType = value;
  }

  get required(): boolean {
    return this._required;
  }

  set required(value: boolean) {
    this._required = value;
  }

  get displayOrder(): number {
    return this._displayOrder;
  }

  set displayOrder(value: number) {
    this._displayOrder = value;
  }

  isPeriodField(): boolean {
    return PERIOD_FIELD_KEYS.includes(this._key);
  }
}
