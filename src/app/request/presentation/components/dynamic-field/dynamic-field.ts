import {Component, input} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {RequestField} from '../../../domain/model/request-field.entity';

/** One input of the request form, drawn according to the data type of the RequestField. */
@Component({
  selector: 'app-dynamic-field',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './dynamic-field.html',
  styleUrl: './dynamic-field.css',
})
export class DynamicField extends BaseForm {
  readonly field = input.required<RequestField>();
  /** Form of the request; it has one control per field, named with the field key. */
  readonly form = input.required<FormGroup>();
  readonly idPrefix = input('field');

  get inputId(): string {
    return `${this.idPrefix()}-${this.field().key}`;
  }

  get control(): FormControl<string> {
    return this.form().controls[this.field().key] as FormControl<string>;
  }

  get invalid(): boolean {
    return this.isInvalidControl(this.form(), this.field().key);
  }

  get errorKey(): string {
    return this.errorKeyForControl(this.form(), this.field().key);
  }
}
