import {Component, computed, inject, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';

@Component({
  selector: 'app-vacation-balance-card',
  imports: [DecimalPipe, RouterLink, TranslatePipe],
  templateUrl: './vacation-balance-card.html',
  styleUrl: './vacation-balance-card.css',
})
/**
 * Shows the "Vacation balance" card on the right column of the employee file (WA-04). It is
 * registered in the EMPLOYEE_FILE_SECTIONS of app.config.ts.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class VacationBalanceCard {
  private store = inject(BenefitsStore);
  readonly employeeId = input.required<number>();

  readonly balance = computed(() =>
    this.store.vacationBalances().find(balance => balance.employeeId === this.employeeId()));
}
