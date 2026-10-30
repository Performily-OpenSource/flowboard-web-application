import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
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
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {BenefitsStore} from '../../../application/benefits.store';
import {WorkspaceAcl} from '../../../infrastructure/workspace-acl';
import {BenefitsHeader} from '../../components/benefits-header/benefits-header';
import {BenefitsTabs} from '../../components/benefits-tabs/benefits-tabs';
import {BenefitsFeedback} from '../../components/benefits-feedback/benefits-feedback';
import {ListPagination} from '../../../../shared/presentation/components/list-pagination/list-pagination';
import {BenefitQuantity} from '../../components/benefit-quantity/benefit-quantity';
import {PluralKeyPipe} from '../../pipes/plural-key-pipe';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-benefit-deliveries',
  imports: [
    RouterLink,
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe, LocalDatePipe, PluralKeyPipe,
    BenefitsHeader, BenefitsTabs, BenefitsFeedback, ListPagination, BenefitQuantity
  ],
  templateUrl: './benefit-deliveries.html',
  styleUrl: './benefit-deliveries.css',
})
/**
 * Displays the registered deliveries: who received which benefit, when and who registered it. They
 * can be filtered by benefit and by delivery date.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitDeliveries {
  readonly store = inject(BenefitsStore);
  private directory = inject(WorkspaceAcl);

  readonly columns = ['employee', 'benefit', 'deliveredOn', 'quantity', 'registeredBy', 'notes'];
  readonly pageSize = PAGE_SIZE;
  readonly page = signal(0);

  readonly benefitFilter = signal<number | null>(null);
  readonly fromDate = signal('');
  readonly toDate = signal('');

  readonly filteredDeliveries = computed(() => this.store.deliveredAssignments().filter(assignment => {
    const deliveredOn = assignment.delivery?.deliveredOn ?? '';
    return (this.benefitFilter() === null || assignment.benefitTypeId === this.benefitFilter()) &&
      (this.fromDate() === '' || deliveredOn >= this.fromDate()) &&
      (this.toDate() === '' || deliveredOn <= this.toDate());
  }));

  readonly pageDeliveries = computed(() =>
    this.filteredDeliveries().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));

  /** Assignments that still wait for their delivery, shown in the link to the assignments tab. */
  readonly pendingCount = computed(() =>
    this.store.assignments().filter(assignment => assignment.status === 'ASSIGNED').length);

  /** Whether any filter is applied. */
  readonly hasFilters = computed(() => this.benefitFilter() !== null || this.fromDate() !== '' || this.toDate() !== '');

  /**
   * Finds the summary of an employee to show it in the table.
   * @param employeeId Identifier of the employee (EmployeeId of the Shared Kernel).
   * @author Salym
   */
  employee(employeeId: number | null | undefined) {
    return employeeId != null ? this.directory.findEmployee(employeeId) : undefined;
  }

  /**
   * Gets the name of a benefit to show it in the filter.
   * @param benefitTypeId Identifier of the benefit type.
   * @author Salym
   */
  benefitName(benefitTypeId: number | null): string {
    return this.store.benefitTypes().find(type => type.id === benefitTypeId)?.name ?? '';
  }

  /**
   * Filters the deliveries by benefit.
   * @param benefitTypeId Identifier of the benefit type, or null for all benefits.
   * @author Salym
   */
  setBenefit(benefitTypeId: number | null) {
    this.benefitFilter.set(benefitTypeId);
    this.page.set(0);
  }

  /**
   * Changes one end of the delivery date filter.
   * @param end End of the range that changed.
   * @param event Change event of the date input.
   * @author Salym
   */
  setDate(end: 'from' | 'to', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    (end === 'from' ? this.fromDate : this.toDate).set(value);
    this.page.set(0);
  }

  /**
   * Removes every filter.
   * @author Salym
   */
  clearFilters() {
    this.benefitFilter.set(null);
    this.fromDate.set('');
    this.toDate.set('');
    this.page.set(0);
  }
}
