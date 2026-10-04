import {Component, computed, inject} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {WorkspaceAcl} from '../../../infrastructure/workspace-acl';
import {VacationBalance} from '../../../domain/model/vacation-balance.entity';
import {EmployeeSummaryPanel} from '../employee-summary-panel/employee-summary-panel';

/**
 * Data received by the vacation movements dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface VacationMovementsData {
  balance: VacationBalance;
}

@Component({
  selector: 'app-vacation-movements-dialog',
  imports: [DecimalPipe, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, LocalDatePipe,
    EmployeeSummaryPanel],
  templateUrl: './vacation-movements-dialog.html',
  styleUrl: './vacation-movements-dialog.css',
})
/**
 * Shows the history of a vacation balance: every accrual, usage, reversal and manual adjustment.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class VacationMovementsDialog {
  private directory = inject(WorkspaceAcl);
  readonly balance = inject<VacationMovementsData>(MAT_DIALOG_DATA).balance;

  readonly movements = computed(() =>
    [...this.balance.movements].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));

  /**
   * Gets the name of the employee that made a movement.
   * @param authorId Identifier of the author of the movement, or null.
   * @author Salym
   */
  authorName(authorId: number | null): string {
    return authorId !== null ? this.directory.findEmployee(authorId)?.fullName ?? '' : '';
  }
}
