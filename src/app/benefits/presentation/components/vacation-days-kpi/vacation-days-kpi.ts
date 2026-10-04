import {Component, computed, inject} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';

/**
 * "Available vacation" indicator of the HR dashboard (WA-02), registered in DASHBOARD_WIDGETS
 * for the 'hr' dashboard in the 'kpi' slot. Shows the total available vacation days and how
 * many employees still have days to take.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-vacation-days-kpi',
  imports: [TranslatePipe, DecimalPipe],
  templateUrl: './vacation-days-kpi.html',
  styleUrl: './vacation-days-kpi.css',
})
export class VacationDaysKpi {
  private readonly store = inject(BenefitsStore);

  /** Total available vacation days across every balance. */
  readonly totalAvailableDays = computed(() =>
    Math.round(this.store.vacationBalances().reduce((total, balance) => total + balance.availableDays(), 0) * 10) / 10);

  /** Number of employees whose balance still has available days. */
  readonly employeesWithDays = computed(() =>
    this.store.vacationBalances().filter(balance => balance.availableDays() > 0).length);
}
