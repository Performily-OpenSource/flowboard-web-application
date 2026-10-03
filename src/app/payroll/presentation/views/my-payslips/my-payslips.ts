import {Component, computed, inject, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {PayrollStore} from '../../../application/payroll.store';
import {Payslip} from '../../../domain/model/payslip.entity';
import {PayslipViewDialog} from '../../components/payslip-view-dialog/payslip-view-dialog';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-my-payslips',
  imports: [MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatIcon, MatProgressBar, TranslatePipe, LocalDatePipe],
  templateUrl: './my-payslips.html',
  styleUrl: './my-payslips.css'
})
/**
 * Displays the payslips available to the authenticated employee.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class MyPayslips {
  readonly store = inject(PayrollStore);
  private readonly dialog = inject(MatDialog);
  readonly columns = ['period', 'issueDate', 'netAmount', 'status', 'actions'];
  readonly yearFilter = signal<number | null>(null);
  readonly periodFilter = signal<number | null>(null);
  readonly page = signal(0);
  readonly years = computed(() => [...new Set(this.store.periods().map(period => period.periodYear))].sort((a, b) => b - a));
  readonly effectiveYear = computed(() => this.yearFilter() ?? this.years()[0] ?? new Date().getFullYear());
  readonly filteredPayslips = computed(() => this.store.visiblePayslipsForEmployee(this.store.currentEmployeeId())
    .filter(payslip => {
      const period = this.store.getPeriodById(payslip.payrollPeriodId);
      return period?.periodYear === this.effectiveYear() && (this.periodFilter() === null || payslip.payrollPeriodId === this.periodFilter());
    }));
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredPayslips().length / PAGE_SIZE)));
  readonly pages = computed(() => Array.from({length: this.pageCount()}, (_, index) => index));
  readonly pagePayslips = computed(() => this.filteredPayslips().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  readonly rangeStart = computed(() => this.filteredPayslips().length ? this.page() * PAGE_SIZE + 1 : 0);
  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredPayslips().length));

/**
 * Executes the employeeName operation of the component.
 * @author Diana Li
 */
  employeeName(): string { return this.store.getEmployeeById(this.store.currentEmployeeId())?.fullName ?? '—'; }
/**
 * Executes the periodLabel operation of the component.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  periodLabel(id: number): string { return this.store.getPeriodById(id)?.label() ?? '—'; }
/**
 * Executes the money operation of the component.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  money(payslip: Payslip): string { return `S/ ${payslip.netAmount.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`; }
/**
 * Executes the setYear operation of the component.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
  setYear(value: string) { this.yearFilter.set(Number(value)); this.periodFilter.set(null); this.page.set(0); }
/**
 * Updates the selected period filter.
 * @param value Parameter used by the operation.
 * @author Diana Li
 */
  setPeriod(value: string) { this.periodFilter.set(value ? Number(value) : null); this.page.set(0); }

/**
 * Opens the payslip view.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  openViewer(payslip: Payslip) { this.dialog.open(PayslipViewDialog, {data: {payslip}, width: '900px', maxWidth: '96vw'}).afterClosed().subscribe(); }
/**
 * Downloads the payslip file.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  download(payslip: Payslip) {
    const link = document.createElement('a');
    link.href = payslip.file.storageUrl;
    link.download = payslip.file.fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  }
}
