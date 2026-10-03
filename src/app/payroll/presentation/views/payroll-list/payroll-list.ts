import {Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {PayrollStore} from '../../../application/payroll.store';
import {PaymentStatus, Payslip} from '../../../domain/model/payslip.entity';
import {PayslipUploadDialog} from '../../components/payslip-upload-dialog/payslip-upload-dialog';
import {PaymentDialog} from '../../components/payment-dialog/payment-dialog';
import {ObservationDialog} from '../../components/observation-dialog/observation-dialog';
import {PayslipViewDialog} from '../../components/payslip-view-dialog/payslip-view-dialog';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-payroll-list',
  imports: [MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, MatProgressBar, TranslatePipe, LocalDatePipe],
  templateUrl: './payroll-list.html',
  styleUrl: './payroll-list.css'
})
/**
 * Displays and manages the administrative list of payslips.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollList {
  readonly store = inject(PayrollStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  readonly columns = ['employee', 'period', 'issueDate', 'netAmount', 'paymentStatus', 'actions'];
  readonly paymentStatuses: PaymentStatus[] = ['PENDING', 'PAID', 'OBSERVED'];
  readonly periodFilter = signal<number | null>(null);
  readonly areaFilter = signal<number | null>(null);
  readonly paymentFilter = signal<PaymentStatus | null>(null);
  readonly page = signal(0);

  readonly filteredPayslips = computed(() => this.store.payslips()
    .filter(payslip => this.periodFilter() === null || payslip.payrollPeriodId === this.periodFilter())
    .filter(payslip => this.areaFilter() === null || this.store.getEmployeeById(payslip.employeeId)?.areaId === this.areaFilter())
    .filter(payslip => this.paymentFilter() === null || payslip.payment.status === this.paymentFilter())
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate)));
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredPayslips().length / PAGE_SIZE)));
  readonly pages = computed(() => Array.from({length: this.pageCount()}, (_, index) => index));
  readonly pagePayslips = computed(() => this.filteredPayslips().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  readonly rangeStart = computed(() => this.filteredPayslips().length ? this.page() * PAGE_SIZE + 1 : 0);
  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredPayslips().length));

/**
 * Updates the selected period filter.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
  setPeriod(value: string) { this.periodFilter.set(value ? Number(value) : null); this.page.set(0); }
/**
 * Updates the selected area filter.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
  setArea(value: string) { this.areaFilter.set(value ? Number(value) : null); this.page.set(0); }
/**
 * Updates the payment status filter.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
  setPaymentStatus(value: string) { this.paymentFilter.set(value ? value as PaymentStatus : null); this.page.set(0); }

/**
 * Executes the periodLabel operation of the component.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  periodLabel(id: number): string { return this.store.getPeriodById(id)?.label() ?? '—'; }
/**
 * Executes the employeeName operation of the component.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  employeeName(id: number): string { return this.store.getEmployeeById(id)?.fullName ?? '—'; }
/**
 * Executes the initials operation of the component.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  initials(id: number): string {
    const employee = this.store.getEmployeeById(id);
    return employee ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase() : '—';
  }
/**
 * Executes the money operation of the component.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  money(payslip: Payslip): string { return `S/ ${payslip.netAmount.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`; }

/**
 * Opens the dialog for uploading a payslip.
 * @author Diana Li
 */
  openUpload() { this.router.navigate(['/payroll/payslips/upload']); }
/**
 * Opens the flow for replacing a payslip.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  openReplace(payslip: Payslip) { this.dialog.open(PayslipUploadDialog, {data: {payslip}, width: '620px', maxWidth: '95vw'}).afterClosed().subscribe(); }
/**
 * Opens the dialog for recording a payment.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  openPayment(payslip: Payslip) { this.dialog.open(PaymentDialog, {data: {payslip}, width: '540px', maxWidth: '95vw'}).afterClosed().subscribe(); }
/**
 * Opens the dialog for recording an observation.
 * @param payslip Parameter used by the operation.
 * @param readOnly Parameter used by the operation.
 * @author Diana Li
 */
  openObservation(payslip: Payslip, readOnly = false) {
    this.dialog.open(ObservationDialog, {data: {payslip, readOnly}, width: '540px', maxWidth: '95vw'}).afterClosed().subscribe();
  }
/**
 * Opens the payslip view.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  openViewer(payslip: Payslip) { this.dialog.open(PayslipViewDialog, {data: {payslip}, width: '900px', maxWidth: '96vw'}).afterClosed().subscribe(); }

/**
 * Publishes the payslip and records its publication date.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  publish(payslip: Payslip) {
    this.store.publishPayslip(payslip);
  }

/**
 * Executes the statusKey operation of the component.
 * @param status Parameter used by the operation.
 * @author Diana Li
 */
  statusKey(status: PaymentStatus): string { return `payroll.payment-status.${status}`; }
/**
 * Executes the statusClass operation of the component.
 * @param status Parameter used by the operation.
 * @author Diana Li
 */
  statusClass(status: PaymentStatus): string { return `payment-${status.toLowerCase()}`; }
}
