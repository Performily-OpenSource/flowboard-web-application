import {Component, inject} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {BenefitsStore} from '../../../application/benefits.store';
import {BenefitAssignment} from '../../../domain/model/benefit-assignment.entity';
import {EmployeeSummaryPanel} from '../employee-summary-panel/employee-summary-panel';
import {BenefitQuantity} from '../benefit-quantity/benefit-quantity';
import {localToday} from '../../../application/local-today';
import {notAfter} from '../../validators/benefits-validators';
import {guardUnsavedChanges} from '../benefits-confirm-dialog/guard-unsaved-changes';

/**
 * Data received by the register delivery dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface RegisterDeliveryData {
  assignment: BenefitAssignment;
}

@Component({
  selector: 'app-register-delivery-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, LocalDatePipe,
    EmployeeSummaryPanel, BenefitQuantity],
  templateUrl: './register-delivery-dialog.html',
  styleUrl: './register-delivery-dialog.css',
})
/**
 * Manages the registration of the delivery of an assignment (WA-30); a delivery can be registered
 * only once.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class RegisterDeliveryDialog extends BaseForm {
  private fb = inject(FormBuilder);
  private store = inject(BenefitsStore);
  private dialogRef = inject(MatDialogRef<RegisterDeliveryDialog>);
  readonly assignment = inject<RegisterDeliveryData>(MAT_DIALOG_DATA).assignment;

  /** Today in the local time zone (not UTC, which in Lima is already tomorrow after 19:00). */
  readonly today = localToday();

  /** Latest valid delivery date: the end of the validity or today, whichever comes first. */
  readonly maxDate = this.assignment.validity.endDate < this.today ? this.assignment.validity.endDate : this.today;

  /** The delivery cannot happen before the assignment starts. */
  private readonly notBeforeValidity = (control: AbstractControl<string>): ValidationErrors | null =>
    control.value && control.value < this.assignment.validity.startDate ? { beforeValidity: true } : null;

  readonly form = this.fb.group({
    deliveredOn: new FormControl<string>(this.defaultDate(),
      { nonNullable: true, validators: [Validators.required, this.notBeforeValidity, notAfter(() => this.maxDate)] }),
    notes: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(250)] })
  });

  readonly blocked = this.assignment.isDelivered() || this.assignment.isCancelled();

  /** Protects the unsaved changes of the form. */
  constructor() {
    super();
    guardUnsavedChanges(this.dialogRef, this.form, inject(MatDialog));
  }

  /**
   * Proposes today as delivery date, moved inside the validity when today is outside of it.
   * @author Salym
   */
  private defaultDate(): string {
    const { startDate, endDate } = this.assignment.validity;
    if (this.today < startDate) return startDate;
    return this.today > endDate ? endDate : this.today;
  }

  /**
   * Validates the delivery date and registers the delivery.
   * @author Salym
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.blocked) return;
    const value = this.form.getRawValue();
    this.store.registerDelivery(this.assignment, value.deliveredOn, value.notes);
    this.dialogRef.close(true);
  }
}
