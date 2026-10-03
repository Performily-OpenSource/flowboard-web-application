import {Component, inject} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {Payslip} from '../../../domain/model/payslip.entity';
import {PayrollStore} from '../../../application/payroll.store';

/**
 * Input data used by the payslip view dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Diana Li
 */
export interface PayslipViewDialogData { payslip: Payslip; }

@Component({
  selector: 'app-payslip-view-dialog',
  imports: [MatDialogClose, MatDialogTitle, MatButton, MatIcon, TranslatePipe],
  templateUrl: './payslip-view-dialog.html',
  styleUrl: './payslip-view-dialog.css'
})
/**
 * Displays a payslip and allows it to be downloaded or printed.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayslipViewDialog {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly store = inject(PayrollStore);
  readonly data = inject<PayslipViewDialogData>(MAT_DIALOG_DATA);
  readonly employee = this.store.getEmployeeById(this.data.payslip.employeeId);
  readonly period = this.store.getPeriodById(this.data.payslip.payrollPeriodId);
  readonly previewUrl: SafeResourceUrl | null = this.data.payslip.file.storageUrl
    ? this.sanitizer.bypassSecurityTrustResourceUrl(this.data.payslip.file.storageUrl)
    : null;

/**
 * Downloads the payslip file.
 * @author Diana Li
 */
  download(): void {
    const link = document.createElement('a');
    link.href = this.data.payslip.file.storageUrl;
    link.download = this.data.payslip.file.fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  }

/**
 * Prints the displayed payslip.
 * @author Diana Li
 */
  print(): void {
    const printWindow = window.open(this.data.payslip.file.storageUrl, '_blank', 'noopener,noreferrer');
    printWindow?.focus();
  }
}
