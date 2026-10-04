import {Component, computed, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {VacationBalance} from '../../../domain/model/vacation-balance.entity';

/**
 * Card of the request form that shows the vacation balance of the employee and warns
 * when the days requested are more than the days available (US30).
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-vacation-balance-card',
  imports: [TranslatePipe],
  templateUrl: './vacation-balance-card.html',
  styleUrl: './vacation-balance-card.css',
})
export class VacationBalanceCard {
  /** Vacation balance of the employee, or null when there is none. */
  readonly balance = input.required<VacationBalance | null>();
  /** Working days requested in the form. */
  readonly requestedDays = input(0);

  /** Whether the balance does not cover the days requested. */
  readonly insufficient = computed(() => {
    const balance = this.balance();
    return !!balance && !balance.hasEnough(this.requestedDays());
  });
}
