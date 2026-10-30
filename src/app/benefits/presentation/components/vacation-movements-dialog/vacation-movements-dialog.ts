import {Component, computed, inject} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {WorkspaceAcl} from '../../../infrastructure/workspace-acl';
import {BenefitsStore} from '../../../application/benefits.store';
import {VacationBalance} from '../../../domain/model/vacation-balance.entity';
import {EmployeeSummaryPanel} from '../employee-summary-panel/employee-summary-panel';
import {PluralKeyPipe} from '../../pipes/plural-key-pipe';

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
    EmployeeSummaryPanel, PluralKeyPipe],
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
  private store = inject(BenefitsStore);
  readonly balance = inject<VacationMovementsData>(MAT_DIALOG_DATA).balance;

  /** Balance of the store, which gets its movements once the web service answers. */
  private readonly currentBalance = computed(() =>
    this.store.getBalanceByEmployeeId(this.balance.employeeId) ?? this.balance);

  /**
   * Asks the store for the movements of the balance.
   * @remarks The list of balances of the web service comes without movements, so they are loaded
   * when the dialog opens.
   * @author Salym
   */
  constructor() {
    this.store.loadMovements(this.balance.employeeId);
  }

  /**
   * Movements from the newest to the oldest, each one with the available days that remained after
   * it. The balance is rebuilt backwards from the current available days.
   */
  readonly movements = computed(() => {
    const balance = this.currentBalance();
    const sorted = [...balance.movements].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    let balanceAfter = balance.availableDays();
    return sorted.map(movement => {
      const row = { movement, balanceAfter: Math.round(balanceAfter * 100) / 100 };
      balanceAfter -= movement.days;
      return row;
    });
  });

  /**
   * Gets the name of the employee that made a movement.
   * @param authorId Identifier of the author of the movement, or null.
   * @author Salym
   */
  authorName(authorId: number | null): string {
    return authorId !== null ? this.directory.findEmployee(authorId)?.fullName ?? '' : '';
  }
}
