import {Component, inject} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {BenefitsStore} from '../../../application/benefits.store';
import {BenefitAssignment} from '../../../domain/model/benefit-assignment.entity';
import {EmployeeSummaryPanel} from '../employee-summary-panel/employee-summary-panel';
import {BenefitQuantity} from '../benefit-quantity/benefit-quantity';

export interface RegisterDeliveryData {
  assignment: BenefitAssignment;
}

/** WA-30 Registrar entrega: a delivery can be registered only once per assignment. */
@Component({
  selector: 'app-register-delivery-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, LocalDatePipe,
    EmployeeSummaryPanel, BenefitQuantity],
  templateUrl: './register-delivery-dialog.html',
})
export class RegisterDeliveryDialog extends BaseForm {
  private fb = inject(FormBuilder);
  private store = inject(BenefitsStore);
  private dialogRef = inject(MatDialogRef<RegisterDeliveryDialog>);
  readonly assignment = inject<RegisterDeliveryData>(MAT_DIALOG_DATA).assignment;

  /** The delivery cannot happen before the assignment starts. */
  private readonly notBeforeValidity = (control: AbstractControl<string>): ValidationErrors | null =>
    control.value && control.value < this.assignment.validity.startDate ? { beforeValidity: true } : null;

  readonly form = this.fb.group({
    deliveredOn: new FormControl<string>(new Date().toISOString().substring(0, 10),
      { nonNullable: true, validators: [Validators.required, this.notBeforeValidity] }),
    notes: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(255)] })
  });

  readonly blocked = this.assignment.isDelivered() || this.assignment.isCancelled();

  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.blocked) return;
    const value = this.form.getRawValue();
    this.store.registerDelivery(this.assignment, value.deliveredOn, value.notes);
    this.dialogRef.close(true);
  }
}
