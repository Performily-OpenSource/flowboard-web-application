import {computed, inject, Injectable} from '@angular/core';
import {BenefitsStore} from '../../benefits/application/benefits.store';
import {VacationBalance as BenefitsVacationBalance} from '../../benefits/domain/model/vacation-balance.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';


@Injectable({providedIn: 'root'})
export class BenefitsAcl {
  private readonly benefitsStore = inject(BenefitsStore);

  /** Vacation balances translated to the read model of Request. */
  readonly vacationBalances = computed(() =>
    this.benefitsStore.vacationBalances().map(balance => this.toVacationBalance(balance)));

 
  debitVacationDays(employeeId: number, days: number, requestId: number): void {
    this.benefitsStore.debitVacationDays(employeeId, days, requestId);
  }

  private toVacationBalance(balance: BenefitsVacationBalance): VacationBalance {
    return new VacationBalance({
      id: balance.id,
      employeeId: balance.employeeId,
      accruedDays: balance.accruedDays,
      usedDays: balance.usedDays
    });
  }
}
