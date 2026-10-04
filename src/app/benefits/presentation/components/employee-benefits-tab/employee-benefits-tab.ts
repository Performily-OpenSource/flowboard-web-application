import {Component, computed, inject, input} from '@angular/core';
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
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {BenefitsStore} from '../../../application/benefits.store';
import {BenefitQuantity} from '../benefit-quantity/benefit-quantity';

@Component({
  selector: 'app-employee-benefits-tab',
  imports: [
    RouterLink,
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    TranslatePipe, LocalDatePipe, BenefitQuantity
  ],
  templateUrl: './employee-benefits-tab.html',
  styleUrl: './employee-benefits-tab.css',
})
/**
 * Shows the "Benefits" tab of the employee file (WA-04) with the benefits assigned to the employee.
 * It is registered in the EMPLOYEE_FILE_SECTIONS of app.config.ts.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class EmployeeBenefitsTab {
  private store = inject(BenefitsStore);
  readonly employeeId = input.required<number>();

  readonly columns = ['benefit', 'validity', 'quantity', 'status'];

  readonly assignments = computed(() =>
    this.store.assignments().filter(assignment => assignment.employeeId === this.employeeId()));
}
