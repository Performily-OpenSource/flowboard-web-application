import {Component, effect, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {PayrollStore} from '../../../application/payroll.store';
import {FileReference, Money, Payslip} from '../../../domain/model/payslip.entity';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Input data used by the payslip upload dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface PayslipUploadDialogData { payslip?: Payslip; }

@Component({
  selector: 'app-payslip-upload-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe],
  templateUrl: './payslip-upload-dialog.html',
  styleUrl: './payslip-upload-dialog.css'
})
/**
 * Manages the upload of a payslip file and its associated data.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayslipUploadDialog {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(PayrollStore);
  private readonly translate = inject(TranslateService);
  private readonly dialogRef = inject(MatDialogRef<PayslipUploadDialog>);
  readonly data = inject<PayslipUploadDialogData>(MAT_DIALOG_DATA);
  readonly isReplacement = !!this.data.payslip;
  readonly selectedFile = signal<File | null>(null);
  readonly duplicate = signal<Payslip | null>(null);
  error = '';
  private readonly initialOperationVersion = this.store.operationVersion();
  private readonly operationEffect = effect(() => {
    const version = this.store.operationVersion();
    if (version <= this.initialOperationVersion) return;
    const operationError = this.store.operationError();
    if (operationError) this.error = operationError;
    else this.dialogRef.close(true);
  });

  readonly form = this.fb.group({
    employeeId: new FormControl<number>(this.data.payslip?.employeeId ?? this.store.currentEmployeeId(), {nonNullable: true, validators: [Validators.required]}),
    payrollPeriodId: new FormControl<number>(this.data.payslip?.payrollPeriodId ?? this.store.latestPeriod()?.id ?? 0, {nonNullable: true, validators: [Validators.required]}),
    issueDate: new FormControl<string>(this.data.payslip?.issueDate ?? new Date().toISOString().slice(0, 10), {nonNullable: true, validators: [Validators.required]}),
    netAmount: new FormControl<number>(this.data.payslip?.netAmount.amount ?? 0, {nonNullable: true, validators: [Validators.required, Validators.min(0.01)]})
  });

/**
 * Validates and submits the form data.
 * @param replace Parameter used by the operation.
 * @author Diana Li
 */
  async submit(replace = false): Promise<void> {
    this.form.markAllAsTouched();
    this.error = '';
    if (this.form.invalid) return;

    const file = this.selectedFile();
    if (!file) {
      this.error = this.translate.instant('payroll.errors.select-file');
      return;
    }
    if (file.type !== 'application/pdf') {
      this.error = this.translate.instant('payroll.errors.pdf-only');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.error = this.translate.instant('payroll.errors.file-too-large');
      return;
    }

    const value = this.form.getRawValue();
    const existing = this.data.payslip ?? this.duplicate();
    if (!existing && this.store.existsForEmployeePeriod(value.employeeId, value.payrollPeriodId)) {
      this.duplicate.set(this.store.payslips().find(item =>
        item.employeeId === value.employeeId && item.payrollPeriodId === value.payrollPeriodId) ?? null);
      this.error = this.translate.instant('payroll.errors.duplicate');
      return;
    }

    if (existing && !replace && !this.isReplacement) {
      this.duplicate.set(existing);
      this.error = this.translate.instant('payroll.errors.duplicate-replace');
      return;
    }

    const dataUrl = await this.readAsDataUrl(file);
    const replacement = new Payslip({
      id: existing?.id ?? 0,
      employeeId: value.employeeId,
      payrollPeriodId: value.payrollPeriodId,
      file: new FileReference({ fileName: file.name, contentType: file.type, sizeInBytes: file.size, storageUrl: dataUrl }),
      issueDate: value.issueDate,
      netAmount: new Money(value.netAmount, 'PEN'),
      publicationStatus: 'UNDER_REVIEW'
    });

    if (existing) this.store.replacePayslip(existing, replacement);
    else this.store.createPayslip(replacement);
  }

/**
 * Processes the file selected by the user.
 * @param event Parameter used by the operation.
 * @author Diana Li
 */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.error = '';
  }

/**
 * Executes the employeeName operation of the component.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  employeeName(id: number): string {
    return this.store.getEmployeeById(id)?.fullName ?? '—';
  }

/**
 * Executes the periodLabel operation of the component.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  periodLabel(id: number): string {
    return this.store.getPeriodById(id)?.label() ?? '—';
  }

/**
 * Executes the readAsDataUrl operation of the component.
 * @param file Parameter used by the operation.
 * @author Diana Li
 */
  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(this.translate.instant('payroll.errors.read-file')));
      reader.readAsDataURL(file);
    });
  }
}
