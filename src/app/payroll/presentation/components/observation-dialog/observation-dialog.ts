import {Component, inject} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {PayrollStore} from '../../../application/payroll.store';
import {Payslip} from '../../../domain/model/payslip.entity';

export interface ObservationDialogData { payslip: Payslip; readOnly?: boolean; }

@Component({
  selector: 'app-observation-dialog',
  imports: [DecimalPipe, ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe],
  templateUrl: './observation-dialog.html',
  styleUrl: './observation-dialog.css'
})
export class ObservationDialog {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(PayrollStore);
  private readonly dialogRef = inject(MatDialogRef<ObservationDialog>);
  readonly data = inject<ObservationDialogData>(MAT_DIALOG_DATA);
  readonly employee = this.store.getEmployeeById(this.data.payslip.employeeId);
  readonly period = this.store.getPeriodById(this.data.payslip.payrollPeriodId);
  readonly readOnly = this.data.readOnly ?? false;
  readonly form = this.fb.group({
    reason: new FormControl(this.data.payslip.payment.observationReason ?? '', {nonNullable: true, validators: [Validators.required, Validators.maxLength(500)]})
  });
  error = '';

  confirm(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.error = '';
    this.store.markAsObserved(this.data.payslip, this.form.controls.reason.value).subscribe({
      next: () => this.dialogRef.close(true),
      error: error => this.error = error instanceof Error ? error.message : 'No se pudo registrar la observación.'
    });
  }
}
