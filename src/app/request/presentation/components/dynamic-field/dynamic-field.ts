import {Component, input} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {RequestField} from '../../../domain/model/request-field.entity';

/**
 * One input of the request form, drawn according to the data type of the RequestField.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-dynamic-field',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './dynamic-field.html',
  styleUrl: './dynamic-field.css',
})
export class DynamicField extends BaseForm {
  /** The field to draw. */
  readonly field = input.required<RequestField>();
  /** Form of the request; it has one control per field, named with the field key. */
  readonly form = input.required<FormGroup>();
  /** Prefix of the input id, so the same field can appear in several forms. */
  readonly idPrefix = input('field');

  /** Id of the input: prefix and field key. */
  get inputId(): string {
    return `${this.idPrefix()}-${this.field().key}`;
  }

  /** Control of the field in the form. */
  get control(): FormControl<string> {
    return this.form().controls[this.field().key] as FormControl<string>;
  }

  /** Whether the control is invalid and was touched. */
  get invalid(): boolean {
    return this.isInvalidControl(this.form(), this.field().key);
  }

  /** Translation key of the control error. */
  get errorKey(): string {
    return this.errorKeyForControl(this.form(), this.field().key);
  }
}
