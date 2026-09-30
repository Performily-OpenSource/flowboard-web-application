import {Component, computed, inject, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';

/** "Saldo de vacaciones" card on the right column of the employee file (WA-04). */
@Component({
  selector: 'app-vacation-balance-card',
  imports: [DecimalPipe, RouterLink, TranslatePipe],
  templateUrl: './vacation-balance-card.html',
  styleUrl: './vacation-balance-card.css',
})
export class VacationBalanceCard {
  private store = inject(BenefitsStore);
  readonly employeeId = input.required<number>();

  readonly balance = computed(() =>
    this.store.vacationBalances().find(balance => balance.employeeId === this.employeeId()));
}
