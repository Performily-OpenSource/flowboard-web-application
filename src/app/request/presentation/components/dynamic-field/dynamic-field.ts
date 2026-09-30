import {Component, input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestField} from '../../../domain/model/request-field.entity';

@Component({
  selector: 'app-dynamic-field',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './dynamic-field.html',
  styleUrl: './dynamic-field.css',
})
export class DynamicField {
  readonly field = input.required<RequestField>();
  readonly control = input.required<FormControl<string>>();
  readonly idPrefix = input('field');
  readonly showErrors = input(false);

  get inputId(): string {
    return `${this.idPrefix()}-${this.field().key}`;
  }

  get invalid(): boolean {
    return this.showErrors() && this.control().invalid;
  }
}
