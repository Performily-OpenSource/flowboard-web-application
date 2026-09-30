import {Component, computed, inject, signal} from '@angular/core';
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
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {BenefitsStore} from '../../../application/benefits.store';
import {EmployeeDirectory} from '../../../application/employee-directory';
import {BenefitsHeader} from '../../components/benefits-header/benefits-header';
import {BenefitsTabs} from '../../components/benefits-tabs/benefits-tabs';
import {BenefitsFeedback} from '../../components/benefits-feedback/benefits-feedback';
import {ListPagination} from '../../components/list-pagination/list-pagination';
import {BenefitQuantity} from '../../components/benefit-quantity/benefit-quantity';

const PAGE_SIZE = 8;

/** Registered deliveries: who received which benefit, when and who registered it. */
@Component({
  selector: 'app-benefit-deliveries',
  imports: [
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    TranslatePipe, LocalDatePipe,
    BenefitsHeader, BenefitsTabs, BenefitsFeedback, ListPagination, BenefitQuantity
  ],
  templateUrl: './benefit-deliveries.html',
  styleUrl: './benefit-deliveries.css',
})
export class BenefitDeliveries {
  readonly store = inject(BenefitsStore);
  private directory = inject(EmployeeDirectory);

  readonly columns = ['employee', 'benefit', 'deliveredOn', 'quantity', 'registeredBy', 'notes'];
  readonly pageSize = PAGE_SIZE;
  readonly page = signal(0);

  readonly pageDeliveries = computed(() =>
    this.store.deliveredAssignments().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));

  employee(employeeId: number) {
    return this.directory.findEmployee(employeeId);
  }
}
