import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {PayrollStore} from '../../../application/payroll.store';
import {FileReference, Money, Payslip} from '../../../domain/model/payslip.entity';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface PayslipUploadDialogData { payslip?: Payslip; }

@Component({
  selector: 'app-payslip-upload-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe],
  templateUrl: './payslip-upload-dialog.html',
  styleUrl: './payslip-upload-dialog.css'
})
export class PayslipUploadDialog {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(PayrollStore);
  private readonly dialogRef = inject(MatDialogRef<PayslipUploadDialog>);
  readonly data = inject<PayslipUploadDialogData>(MAT_DIALOG_DATA);
  readonly isReplacement = !!this.data.payslip;
  readonly selectedFile = signal<File | null>(null);
  readonly duplicate = signal<Payslip | null>(null);
  error = '';

  readonly form = this.fb.group({
    employeeId: new FormControl<number>(this.data.payslip?.employeeId ?? 1, {nonNullable: true, validators: [Validators.required]}),
    payrollPeriodId: new FormControl<number>(this.data.payslip?.payrollPeriodId ?? 1, {nonNullable: true, validators: [Validators.required]}),
    issueDate: new FormControl<string>(this.data.payslip?.issueDate ?? '2026-09-03', {nonNullable: true, validators: [Validators.required]}),
    netAmount: new FormControl<number>(this.data.payslip?.netAmount.amount ?? 0, {nonNullable: true, validators: [Validators.required, Validators.min(0.01)]})
  });

  async submit(replace = false): Promise<void> {
    this.form.markAllAsTouched();
    this.error = '';
    if (this.form.invalid) return;

    const file = this.selectedFile();
    if (!file) {
      this.error = 'Selecciona el archivo PDF de la boleta.';
      return;
    }
    if (file.type !== 'application/pdf') {
      this.error = 'El archivo debe estar en formato PDF.';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.error = 'El archivo supera el tamaño máximo configurado de 5 MB.';
      return;
    }

    const value = this.form.getRawValue();
    const existing = this.data.payslip ?? this.duplicate();
    if (!existing && this.store.existsForEmployeePeriod(value.employeeId, value.payrollPeriodId)) {
      this.duplicate.set(this.store.payslips().find(item =>
        item.employeeId === value.employeeId && item.payrollPeriodId === value.payrollPeriodId) ?? null);
      this.error = 'Ya existe una boleta para ese colaborador y periodo.';
      return;
    }

    if (existing && !replace && !this.isReplacement) {
      this.duplicate.set(existing);
      this.error = 'Ya existe una boleta para ese colaborador y periodo. Puedes reemplazarla o cancelar.';
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

    const request = existing
      ? this.store.replacePayslip(existing, replacement)
      : this.store.createPayslip(replacement);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: error => this.error = error instanceof Error ? error.message : 'No se pudo guardar la boleta.'
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.error = '';
  }

  employeeName(id: number): string {
    return this.store.getEmployeeById(id)?.fullName ?? '—';
  }

  periodLabel(id: number): string {
    return this.store.getPeriodById(id)?.label() ?? '—';
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }
}
