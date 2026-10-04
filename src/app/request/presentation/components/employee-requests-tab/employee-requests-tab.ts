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
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';

/**
 * "Requests" tab of the employee file of Workspace (WA-04), registered in EMPLOYEE_FILE_SECTIONS
 * in the 'requests-tab' slot. Lists every request of the employee with its period and status.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-employee-requests-tab',
  imports: [
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    TranslatePipe,
    LocalDatePipe,
    RequestStatusBadge,
    RequestPeriodPipe
  ],
  templateUrl: './employee-requests-tab.html',
  styleUrl: './employee-requests-tab.css',
})
export class EmployeeRequestsTab {
  private readonly store = inject(RequestStore);

  /** Employee whose requests are listed. */
  readonly employeeId = input.required<number>();

  /** Columns of the table. */
  readonly columns = ['code', 'type', 'period', 'status', 'submittedAt'];
  /** Requests of the employee, newest first. */
  readonly requests = computed(() => this.store.requestsOf(this.employeeId()));
  /** Number of requests not resolved yet. */
  readonly openCount = computed(() => this.requests().filter(request => !request.isResolved()).length);
}
