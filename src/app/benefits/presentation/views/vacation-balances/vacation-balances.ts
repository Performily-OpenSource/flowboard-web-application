import {Component, computed, inject, signal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';
import {WorkspaceAcl, EmployeeSummary} from '../../../infrastructure/workspace-acl';
import {VacationBalance} from '../../../domain/model/vacation-balance.entity';
import {BenefitsTabs} from '../../components/benefits-tabs/benefits-tabs';
import {BenefitsFeedback} from '../../components/benefits-feedback/benefits-feedback';
import {ListPagination} from '../../../../shared/presentation/components/list-pagination/list-pagination';
import {VacationAdjustmentDialog} from '../../components/vacation-adjustment-dialog/vacation-adjustment-dialog';
import {VacationMovementsDialog} from '../../components/vacation-movements-dialog/vacation-movements-dialog';

type AvailabilityFilter = 'ALL' | 'WITH_DAYS' | 'WITHOUT_DAYS';
type SortOrder = 'MOST_AVAILABLE' | 'LEAST_AVAILABLE' | 'NAME';

interface BalanceRow {
  balance: VacationBalance;
  employee: EmployeeSummary | undefined;
}

const PAGE_SIZE = 6;
const HIGH_USAGE = 80;

@Component({
  selector: 'app-vacation-balances',
  imports: [
    DecimalPipe,
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    MatButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe,
    BenefitsTabs, BenefitsFeedback, ListPagination
  ],
  templateUrl: './vacation-balances.html',
  styleUrl: './vacation-balances.css',
})
/**
 * Displays the accrued, used and available vacation days per employee (WA-26).
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class VacationBalances {
  readonly store = inject(BenefitsStore);
  readonly directory = inject(WorkspaceAcl);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  readonly columns = ['employee', 'accrued', 'used', 'available', 'usage', 'actions'];
  readonly availabilityOptions: AvailabilityFilter[] = ['ALL', 'WITH_DAYS', 'WITHOUT_DAYS'];
  readonly sortOptions: SortOrder[] = ['MOST_AVAILABLE', 'LEAST_AVAILABLE', 'NAME'];
  readonly pageSize = PAGE_SIZE;
  readonly highUsage = HIGH_USAGE;

  readonly areaFilter = signal<number | null>(null);
  readonly availabilityFilter = signal<AvailabilityFilter>('ALL');
  readonly sortOrder = signal<SortOrder>('MOST_AVAILABLE');
  readonly page = signal(0);

  readonly rows = computed<BalanceRow[]>(() => {
    const rows = this.store.vacationBalances()
      .map(balance => ({ balance, employee: this.directory.findEmployee(balance.employeeId) }))
      .filter(row =>
        (this.areaFilter() === null || row.employee?.areaId === this.areaFilter()) &&
        (this.availabilityFilter() === 'ALL' ||
          (row.balance.availableDays() > 0) === (this.availabilityFilter() === 'WITH_DAYS')));
    const byName = (a: BalanceRow, b: BalanceRow) => (a.employee?.fullName ?? '').localeCompare(b.employee?.fullName ?? '');
    switch (this.sortOrder()) {
      case 'MOST_AVAILABLE':
        return rows.sort((a, b) => b.balance.availableDays() - a.balance.availableDays() || byName(a, b));
      case 'LEAST_AVAILABLE':
        return rows.sort((a, b) => a.balance.availableDays() - b.balance.availableDays() || byName(a, b));
      default:
        return rows.sort(byName);
    }
  });

  readonly pageRows = computed(() => this.rows().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));

  readonly highUsageCount = computed(() =>
    this.store.vacationBalances().filter(balance => balance.usagePercentage() >= HIGH_USAGE).length);

  /**
   * Gets the name of an area to show it in the filter.
   * @param areaId Identifier of the area (AreaId of the Shared Kernel).
   * @author Salym
   */
  areaName(areaId: number | null): string {
    return this.directory.areas().find(area => area.id === areaId)?.name ?? '';
  }

  /**
   * Filters the balances by area.
   * @param areaId Identifier of the area, or null for all areas.
   * @author Salym
   */
  setArea(areaId: number | null) {
    this.areaFilter.set(areaId);
    this.page.set(0);
  }

  /**
   * Filters the balances by employees with or without available days.
   * @param filter Option selected in the filter.
   * @author Salym
   */
  setAvailability(filter: AvailabilityFilter) {
    this.availabilityFilter.set(filter);
    this.page.set(0);
  }

  /**
   * Changes the sort order of the balances.
   * @param order Sort order selected by the user.
   * @author Salym
   */
  setSort(order: SortOrder) {
    this.sortOrder.set(order);
    this.page.set(0);
  }

  /**
   * Opens the dialog to adjust a vacation balance (WA-31).
   * @param balance Vacation balance of the employee.
   * @author Salym
   */
  adjust(balance: VacationBalance) {
    this.dialog.open(VacationAdjustmentDialog, { data: { balance }, width: '540px', maxWidth: '95vw' });
  }

  /**
   * Opens the history of movements of a vacation balance.
   * @param balance Vacation balance of the employee.
   * @author Salym
   */
  showMovements(balance: VacationBalance) {
    this.dialog.open(VacationMovementsDialog, { data: { balance }, width: '540px', maxWidth: '95vw' });
  }

  /**
   * Exports the filtered balances to a CSV file.
   * @author Salym
   */
  exportBalances() {
    const header = ['vacation-balances.employee', 'vacation-balances.area', 'vacation-balances.accrued',
      'vacation-balances.used', 'vacation-balances.available', 'vacation-balances.usage']
      .map(key => this.translate.instant(key));
    const rows = this.rows().map(row => [
      row.employee?.fullName ?? '',
      row.employee?.areaName ?? '',
      row.balance.accruedDays,
      row.balance.usedDays,
      row.balance.availableDays(),
      `${row.balance.usagePercentage()}%`
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vacation-balances.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
