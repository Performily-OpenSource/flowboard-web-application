import {Component, computed, inject, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
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
import {ASSIGNMENT_STATUSES, AssignmentStatus, BenefitAssignment} from '../../../domain/model/benefit-assignment.entity';
import {BenefitsHeader} from '../../components/benefits-header/benefits-header';
import {BenefitsTabs} from '../../components/benefits-tabs/benefits-tabs';
import {BenefitsFeedback} from '../../components/benefits-feedback/benefits-feedback';
import {ListPagination} from '../../../../shared/presentation/components/list-pagination/list-pagination';
import {BenefitQuantity} from '../../components/benefit-quantity/benefit-quantity';
import {RegisterDeliveryDialog} from '../../components/register-delivery-dialog/register-delivery-dialog';
import {confirmAction} from '../../components/benefits-confirm-dialog/confirm';
import {PluralKeyPipe} from '../../pipes/plural-key-pipe';
import {matchesText} from '../../utils/matches-text';
import {localToday} from '../../../application/local-today';

const PAGE_SIZE = 8;

/**
 * Formats a 'yyyy-MM-dd' date as 'dd/MM/yyyy' for the confirmation message.
 * @param value Date as 'yyyy-MM-dd'.
 * @author Salym
 */
function formatDate(value: string): string {
  return new LocalDatePipe().transform(value);
}

@Component({
  selector: 'app-benefit-assignments',
  imports: [
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe, LocalDatePipe, PluralKeyPipe,
    BenefitsHeader, BenefitsTabs, BenefitsFeedback, ListPagination, BenefitQuantity
  ],
  templateUrl: './benefit-assignments.html',
  styleUrl: './benefit-assignments.css',
})
/**
 * Displays the benefit assignments of the employees and is the entry point of WA-30 Register
 * delivery.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitAssignments {
  readonly store = inject(BenefitsStore);
  readonly directory = inject(WorkspaceAcl);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  readonly statuses = ASSIGNMENT_STATUSES;
  readonly today = localToday();
  readonly columns = ['employee', 'benefit', 'validity', 'quantity', 'status', 'actions'];
  readonly pageSize = PAGE_SIZE;

  readonly statusFilter = signal<AssignmentStatus | null>(this.statusFromUrl());
  readonly benefitFilter = signal<number | null>(null);
  /** Employee received in the URL (?employeeId=), for example from the employee file. */
  readonly employeeFilter = signal<number | null>(this.numberFromUrl('employeeId'));
  readonly searchText = signal('');
  readonly page = signal(0);

  readonly filteredAssignments = computed(() => this.store.assignments().filter(assignment =>
    (this.employeeFilter() === null || assignment.employeeId === this.employeeFilter()) &&
    (this.searchText().trim() === '' ||
      matchesText(this.employee(assignment.employeeId)?.fullName ?? '', this.searchText()) ||
      matchesText(assignment.benefitType?.name ?? '', this.searchText())) &&
    (this.statusFilter() === null || assignment.status === this.statusFilter()) &&
    (this.benefitFilter() === null || assignment.benefitTypeId === this.benefitFilter())));

  readonly pageAssignments = computed(() =>
    this.filteredAssignments().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));

  /** Whether any filter is applied. */
  readonly hasFilters = computed(() => this.statusFilter() !== null || this.benefitFilter() !== null ||
    this.employeeFilter() !== null || this.searchText().trim() !== '');

  /**
   * Filters the assignments by employee or benefit name.
   * @param event Input event of the search box.
   * @author Salym
   */
  onSearch(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.page.set(0);
  }

  /**
   * Removes the employee filter received in the URL.
   * @author Salym
   */
  clearEmployee() {
    this.employeeFilter.set(null);
    this.page.set(0);
  }

  /**
   * Removes every filter.
   * @author Salym
   */
  clearFilters() {
    this.statusFilter.set(null);
    this.benefitFilter.set(null);
    this.employeeFilter.set(null);
    this.searchText.set('');
    this.page.set(0);
  }

  /**
   * Checks whether the delivery of an assignment can be registered today: its validity must have
   * started already.
   * @param assignment Benefit assignment to work with.
   * @author Salym
   */
  hasStarted(assignment: BenefitAssignment): boolean {
    return assignment.validity.startDate <= this.today;
  }

  /**
   * Finds the summary of an employee to show it in the table.
   * @param employeeId Identifier of the employee (EmployeeId of the Shared Kernel).
   * @author Salym
   */
  employee(employeeId: number) {
    return this.directory.findEmployee(employeeId);
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
   * Filters the assignments by status.
   * @param status Status selected in the filter, or null for all statuses.
   * @author Salym
   */
  setStatus(status: AssignmentStatus | null) {
    this.statusFilter.set(status);
    this.page.set(0);
  }

  /**
   * Filters the assignments by benefit.
   * @param benefitTypeId Identifier of the benefit type, or null for all benefits.
   * @author Salym
   */
  setBenefit(benefitTypeId: number | null) {
    this.benefitFilter.set(benefitTypeId);
    this.page.set(0);
  }

  /**
   * Opens the dialog to register the delivery of an assignment.
   * @param assignment Benefit assignment to work with.
   * @author Salym
   */
  registerDelivery(assignment: BenefitAssignment) {
    this.dialog.open(RegisterDeliveryDialog, { data: { assignment }, width: '540px', maxWidth: '95vw' });
  }

  /**
   * Cancels an assignment that was not delivered yet.
   * @param assignment Benefit assignment to work with.
   * @author Salym
   */
  cancel(assignment: BenefitAssignment) {
    confirmAction(this.dialog, {
      titleKey: 'benefits.confirm.cancel-assignment.title',
      messageKey: 'benefits.confirm.cancel-assignment.message',
      params: {
        name: assignment.benefitType?.name ?? '',
        employee: this.employee(assignment.employeeId)?.fullName ?? '',
        from: formatDate(assignment.validity.startDate),
        to: formatDate(assignment.validity.endDate)
      },
      confirmKey: 'benefit-assignments.cancel',
      cancelKey: 'benefits.confirm.keep',
      danger: true
    }).subscribe(confirmed => {
      if (confirmed) this.store.cancelAssignment(assignment);
    });
  }

  /**
   * Reads the status filter from the URL (?status=ASSIGNED), used by the "pending deliveries" link.
   * @author Salym
   */
  private statusFromUrl(): AssignmentStatus | null {
    const status = this.route.snapshot.queryParamMap.get('status');
    return ASSIGNMENT_STATUSES.includes(status as AssignmentStatus) ? status as AssignmentStatus : null;
  }

  /**
   * Reads a numeric query parameter of the URL.
   * @param name Name of the query parameter.
   * @author Salym
   */
  private numberFromUrl(name: string): number | null {
    const value = Number(this.route.snapshot.queryParamMap.get(name));
    return Number.isInteger(value) && value > 0 ? value : null;
  }
}
