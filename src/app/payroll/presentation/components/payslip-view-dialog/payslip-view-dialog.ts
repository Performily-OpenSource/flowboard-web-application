import {Component, inject} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {Payslip} from '../../../domain/model/payslip.entity';
import {PayrollStore} from '../../../application/payroll.store';

export interface PayslipViewDialogData { payslip: Payslip; }

@Component({
  selector: 'app-payslip-view-dialog',
  imports: [MatDialogClose, MatDialogTitle, MatButton, MatIcon, TranslatePipe],
  templateUrl: './payslip-view-dialog.html',
  styleUrl: './payslip-view-dialog.css'
})
export class PayslipViewDialog {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly store = inject(PayrollStore);
  readonly data = inject<PayslipViewDialogData>(MAT_DIALOG_DATA);
  readonly employee = this.store.getEmployeeById(this.data.payslip.employeeId);
  readonly period = this.store.getPeriodById(this.data.payslip.payrollPeriodId);
  readonly previewUrl: SafeResourceUrl | null = this.data.payslip.file.storageUrl
    ? this.sanitizer.bypassSecurityTrustResourceUrl(this.data.payslip.file.storageUrl)
    : null;

  download(): void {
    const link = document.createElement('a');
    link.href = this.data.payslip.file.storageUrl;
    link.download = this.data.payslip.file.fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  }

  print(): void {
    const printWindow = window.open(this.data.payslip.file.storageUrl, '_blank', 'noopener,noreferrer');
    printWindow?.focus();
  }
}
