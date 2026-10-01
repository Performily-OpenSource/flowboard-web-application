import {Component, effect, inject} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {PayrollStore} from '../../../application/payroll.store';
import {Payslip} from '../../../domain/model/payslip.entity';

export interface PaymentDialogData {
  payslip: Payslip;
}

@Component({
  selector: 'app-payment-dialog',
  imports: [DecimalPipe, ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe],
  templateUrl: './payment-dialog.html',
  styleUrl: './payment-dialog.css'
})
export class PaymentDialog {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(PayrollStore);
  private readonly dialogRef = inject(MatDialogRef<PaymentDialog>);
  readonly data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  readonly employee = this.store.getEmployeeById(this.data.payslip.employeeId);
  readonly period = this.store.getPeriodById(this.data.payslip.payrollPeriodId);
  readonly form = this.fb.group({
    paidOn: new FormControl(new Date().toISOString().slice(0, 10), {nonNullable: true, validators: [Validators.required]})
  });
  error = '';
  private readonly initialOperationVersion = this.store.operationVersion();
  private readonly operationEffect = effect(() => {
    const version = this.store.operationVersion();
    if (version <= this.initialOperationVersion) return;
    const operationError = this.store.operationError();
    if (operationError) this.error = operationError;
    else this.dialogRef.close(true);
  });

  confirm(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.error = '';
    this.store.markAsPaid(this.data.payslip, this.form.controls.paidOn.value);
  }
}
