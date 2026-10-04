import {Component, computed, inject, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';


/** Requests shown by the card. */
const LATEST_COUNT = 3;

/**
 * "Latest requests" card of the employee file of Workspace (WA-04), registered in
 * EMPLOYEE_FILE_SECTIONS in the 'aside' slot. Shows the 3 most recent requests with their status.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-latest-requests-card',
  imports: [RouterLink, TranslatePipe, RequestStatusBadge, RequestPeriodPipe],
  templateUrl: './latest-requests-card.html',
  styleUrl: './latest-requests-card.css',
})
export class LatestRequestsCard {
  private readonly store = inject(RequestStore);

  /** Employee whose requests are shown. */
  readonly employeeId = input.required<number>();

  /** Requests of the employee, newest first. */
  readonly requests = computed(() => this.store.requestsOf(this.employeeId()));
  /** The 3 most recent requests. */
  readonly latest = computed(() => this.requests().slice(0, LATEST_COUNT));
}
