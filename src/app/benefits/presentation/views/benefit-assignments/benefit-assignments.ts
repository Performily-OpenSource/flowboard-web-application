import {Component, computed, inject, signal} from '@angular/core';
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

const PAGE_SIZE = 8;

/** Assignments of benefits to employees; entry point of WA-30 Registrar entrega. */
@Component({
  selector: 'app-benefit-assignments',
  imports: [
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe, LocalDatePipe,
    BenefitsHeader, BenefitsTabs, BenefitsFeedback, ListPagination, BenefitQuantity
  ],
  templateUrl: './benefit-assignments.html',
  styleUrl: './benefit-assignments.css',
})
export class BenefitAssignments {
  readonly store = inject(BenefitsStore);
  readonly directory = inject(WorkspaceAcl);
  private dialog = inject(MatDialog);

  readonly statuses = ASSIGNMENT_STATUSES;
  readonly columns = ['employee', 'benefit', 'validity', 'quantity', 'status', 'actions'];
  readonly pageSize = PAGE_SIZE;

  readonly statusFilter = signal<AssignmentStatus | null>(null);
  readonly benefitFilter = signal<number | null>(null);
  readonly page = signal(0);

  readonly filteredAssignments = computed(() => this.store.assignments().filter(assignment =>
    (this.statusFilter() === null || assignment.status === this.statusFilter()) &&
    (this.benefitFilter() === null || assignment.benefitTypeId === this.benefitFilter())));

  readonly pageAssignments = computed(() =>
    this.filteredAssignments().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));

  employee(employeeId: number) {
    return this.directory.findEmployee(employeeId);
  }

  benefitName(benefitTypeId: number | null): string {
    return this.store.benefitTypes().find(type => type.id === benefitTypeId)?.name ?? '';
  }

  setStatus(status: AssignmentStatus | null) {
    this.statusFilter.set(status);
    this.page.set(0);
  }

  setBenefit(benefitTypeId: number | null) {
    this.benefitFilter.set(benefitTypeId);
    this.page.set(0);
  }

  registerDelivery(assignment: BenefitAssignment) {
    this.dialog.open(RegisterDeliveryDialog, { data: { assignment }, width: '540px', maxWidth: '95vw' });
  }

  cancel(assignment: BenefitAssignment) {
    this.store.cancelAssignment(assignment);
  }
}
