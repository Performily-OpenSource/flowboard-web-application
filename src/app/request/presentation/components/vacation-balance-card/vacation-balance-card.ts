import {Component, computed, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {VacationBalance} from '../../../domain/model/vacation-balance.entity';

@Component({
  selector: 'app-vacation-balance-card',
  imports: [TranslatePipe],
  templateUrl: './vacation-balance-card.html',
  styleUrl: './vacation-balance-card.css',
})
export class VacationBalanceCard {
  readonly balance = input.required<VacationBalance | null>();
  readonly requestedDays = input(0);

  readonly insufficient = computed(() => {
    const balance = this.balance();
    return !!balance && !balance.hasEnough(this.requestedDays());
  });
}
