import {Component, computed, inject, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';

/**
 * "My vacation balance" card of the collaborator home (WA-10), registered in DASHBOARD_WIDGETS
 * for the 'employee' dashboard in the 'column-1' slot. Shows the available days of the employee
 * with the accrued and used days, and a shortcut to request vacation.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-my-vacation-balance-card',
  imports: [RouterLink, MatButton, MatIcon, TranslatePipe, DecimalPipe],
  templateUrl: './my-vacation-balance-card.html',
  styleUrl: './my-vacation-balance-card.css',
})
export class MyVacationBalanceCard {
  private readonly store = inject(BenefitsStore);

  /** Identifier of the employee whose balance is shown. */
  readonly employeeId = input.required<number>();

  /** Vacation balance of the employee, or undefined when there is none. */
  readonly balance = computed(() =>
    this.store.vacationBalances().find(balance => balance.employeeId === this.employeeId()));
}
