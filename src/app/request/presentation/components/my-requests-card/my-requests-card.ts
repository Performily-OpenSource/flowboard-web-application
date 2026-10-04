import {Component, computed, inject, input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';

/** Rows shown by the card. */
const VISIBLE_COUNT = 4;

/**
 * "My requests" card of the collaborator home (WA-10), registered in DASHBOARD_WIDGETS
 * for the 'employee' dashboard in the 'column-2' slot. Lists the 4 most recent requests
 * of the employee with their period and status.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-my-requests-card',
  imports: [RouterLink, DatePipe, TranslatePipe, RequestStatusBadge, RequestPeriodPipe],
  templateUrl: './my-requests-card.html',
  styleUrl: './my-requests-card.css',
})
export class MyRequestsCard {
  private readonly store = inject(RequestStore);

  /** Employee whose requests are listed. */
  readonly employeeId = input.required<number>();

  /** The 4 most recent requests of the employee. */
  readonly latest = computed(() => this.store.requestsOf(this.employeeId()).slice(0, VISIBLE_COUNT));
}
