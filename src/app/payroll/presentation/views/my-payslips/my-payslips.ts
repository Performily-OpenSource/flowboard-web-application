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
export class MyPayslips {
  readonly store = inject(PayrollStore);
  private readonly dialog = inject(MatDialog);
  readonly columns = ['period', 'issueDate', 'netAmount', 'status', 'actions'];
  readonly yearFilter = signal(2026);
  readonly periodFilter = signal<number | null>(null);
  readonly page = signal(0);
  readonly years = computed(() => [...new Set(this.store.periods().map(period => period.year))].sort((a, b) => b - a));
  readonly filteredPayslips = computed(() => this.store.visiblePayslipsForEmployee(this.store.currentEmployeeId)
    .filter(payslip => {
      const period = this.store.getPeriodById(payslip.payrollPeriodId);
      return period?.year === this.yearFilter() && (this.periodFilter() === null || payslip.payrollPeriodId === this.periodFilter());
    }));
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredPayslips().length / PAGE_SIZE)));
  readonly pages = computed(() => Array.from({length: this.pageCount()}, (_, index) => index));
  readonly pagePayslips = computed(() => this.filteredPayslips().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  readonly rangeStart = computed(() => this.filteredPayslips().length ? this.page() * PAGE_SIZE + 1 : 0);
  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredPayslips().length));

  employeeName(): string { return this.store.getEmployeeById(this.store.currentEmployeeId)?.fullName ?? '—'; }
  periodLabel(id: number): string { return this.store.getPeriodById(id)?.label() ?? '—'; }
  money(payslip: Payslip): string { return `S/ ${payslip.netAmount.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`; }
  setYear(value: string) { this.yearFilter.set(Number(value)); this.periodFilter.set(null); this.page.set(0); }
  setPeriod(value: string) { this.periodFilter.set(value ? Number(value) : null); this.page.set(0); }

  openViewer(payslip: Payslip) { this.dialog.open(PayslipViewDialog, {data: {payslip}, width: '900px', maxWidth: '96vw'}).afterClosed().subscribe(); }
  download(payslip: Payslip) {
    const link = document.createElement('a');
    link.href = payslip.file.storageUrl;
    link.download = payslip.file.fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  }
}
