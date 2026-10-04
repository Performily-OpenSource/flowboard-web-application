import {Component, computed, inject, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {BenefitsStore} from '../../../application/benefits.store';
import {BenefitQuantity} from '../benefit-quantity/benefit-quantity';

/** Number of benefits shown in the card. */
const VISIBLE_BENEFITS = 4;

/**
 * "My benefits" card of the collaborator home (US40), registered in DASHBOARD_WIDGETS
 * for the 'employee' dashboard in the 'column-1' slot. Lists the benefits assigned to the
 * employee with their validity, quantity and status; cancelled assignments are not shown.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-my-benefits-card',
  imports: [TranslatePipe, LocalDatePipe, BenefitQuantity],
  templateUrl: './my-benefits-card.html',
  styleUrl: './my-benefits-card.css',
})
export class MyBenefitsCard {
  private readonly store = inject(BenefitsStore);

  /** Identifier of the employee whose benefits are shown. */
  readonly employeeId = input.required<number>();

  /** Assignments of the employee that are not cancelled, newest validity first. */
  private readonly assignments = computed(() => this.store.assignments()
    .filter(assignment => assignment.employeeId === this.employeeId() && !assignment.isCancelled()));

  /** Assignments shown in the card. */
  readonly visibleAssignments = computed(() => this.assignments().slice(0, VISIBLE_BENEFITS));

  /** Number of assignments that are not shown. */
  readonly hiddenCount = computed(() => Math.max(0, this.assignments().length - VISIBLE_BENEFITS));
}
