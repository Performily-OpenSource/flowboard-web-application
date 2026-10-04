import {computed, inject, Injectable} from '@angular/core';
import {BenefitsStore} from '../../benefits/application/benefits.store';
import {VacationBalance as BenefitsVacationBalance} from '../../benefits/domain/model/vacation-balance.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';


/**
 * Anti-corruption layer from the Request bounded context to Benefits.
 *
 * @remarks
 * Translates the vacation balances of Benefits to the VacationBalance read model of Request and
 * forwards the vacation days to debit when a vacation request is approved. Request never uses the
 * Benefits model directly.
 * @author Diego Alonso Diaz Villalba
 */
@Injectable({providedIn: 'root'})
export class BenefitsAcl {
  private readonly benefitsStore = inject(BenefitsStore);

  /** Vacation balances of Benefits translated to the read model of Request. */
  readonly vacationBalances = computed(() =>
    this.benefitsStore.vacationBalances().map(balance => this.toVacationBalance(balance)));

 
  /**
   * Asks Benefits to debit the vacation days of an approved request.
   *
   * @param employeeId - The requester's employee identifier.
   * @param days - The working days to debit.
   * @param requestId - The approved request, kept as the reference of the movement.
   * @author Diego Alonso Diaz Villalba
   */
  debitVacationDays(employeeId: number, days: number, requestId: number): void {
    this.benefitsStore.debitVacationDays(employeeId, days, requestId);
  }

  /**
   * Translates a Benefits vacation balance to the read model of Request.
   *
   * @param balance - The balance of the Benefits bounded context.
   * @returns The VacationBalance of Request
   * @author Diego Alonso Diaz Villalba
   */
  private toVacationBalance(balance: BenefitsVacationBalance): VacationBalance {
    return new VacationBalance({
      id: balance.id,
      employeeId: balance.employeeId,
      accruedDays: balance.accruedDays,
      usedDays: balance.usedDays
    });
  }
}
