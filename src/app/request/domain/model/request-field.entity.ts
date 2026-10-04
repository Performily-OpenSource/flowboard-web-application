/** Data type of a request field; it decides the input drawn in the request form. */
export type FieldDataType = 'TEXT' | 'NUMBER' | 'DATE' | 'TIME' | 'MONEY' | 'BOOLEAN';

/** All supported field data types, e.g. for select options. */
export const FIELD_DATA_TYPES: FieldDataType[] = ['TEXT', 'NUMBER', 'DATE', 'TIME', 'MONEY', 'BOOLEAN'];

/** Keys of the fields that define the period of a request (dates and times). */
export const PERIOD_FIELD_KEYS = ['startDate', 'endDate', 'startTime', 'endTime'];

/** Valid field key: camelCase, starts with a lowercase letter, 2 to 50 characters. */
export const FIELD_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{1,49}$/;

/**
 * Field of a request type that the employee fills in when submitting a request (US28).
 * Defines its key, label, data type, whether it is required and its position in the form.
 *
 * @author Diego Alonso Diaz Villalba
 */
export class RequestField {
  private _id: number;
  private _key: string;
  private _label: string;
  private _dataType: FieldDataType;
  private _required: boolean;
  private _displayOrder: number;

  /**
   * Creates a new RequestField.
   *
   * @param props - The field data: identifier, key, label, data type, required flag and display order.
   * @author Diego Alonso Diaz Villalba
   */
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

  /** Unique identifier of the field within its request type. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Key that identifies the value of the field in a request, e.g. 'startDate'. */
  get key(): string {
    return this._key;
  }

  set key(value: string) {
    this._key = value;
  }

  /** Label shown to the employee in the request form. */
  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  /** Data type of the field. */
  get dataType(): FieldDataType {
    return this._dataType;
  }

  set dataType(value: FieldDataType) {
    this._dataType = value;
  }

  /** Whether the employee must fill in the field. */
  get required(): boolean {
    return this._required;
  }

  set required(value: boolean) {
    this._required = value;
  }

  /** Position of the field in the request form, starting at 1. */
  get displayOrder(): number {
    return this._displayOrder;
  }

  set displayOrder(value: number) {
    this._displayOrder = value;
  }

  /**
   * Checks whether the field is part of the request period.
   *
   * @returns True if its key is one of PERIOD_FIELD_KEYS, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isPeriodField(): boolean {
    return PERIOD_FIELD_KEYS.includes(this._key);
  }
}
