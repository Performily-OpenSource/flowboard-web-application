import {Component, computed, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';

/** Hours a request may wait before it counts as delayed (2 days). */
const DELAYED_AFTER_HOURS = 48;

/**
 * "Pending requests" indicator of the HR dashboard (WA-02), registered in DASHBOARD_WIDGETS
 * for the 'hr' dashboard in the 'kpi' slot. Shows the inbox requests still to resolve
 * (pending or under review) and how many of them were submitted more than 2 days ago.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-pending-requests-kpi',
  imports: [TranslatePipe],
  templateUrl: './pending-requests-kpi.html',
  styleUrl: './pending-requests-kpi.css',
})
export class PendingRequestsKpi {
  private readonly store = inject(RequestStore);

  /** Inbox requests not resolved yet (status IN_PROGRESS or UNDER_REVIEW). */
  readonly unresolvedRequests = computed(() => this.store.inboxRequests().filter(request => !request.isResolved()));

  /** Number of requests still to resolve. */
  readonly pendingCount = computed(() => this.unresolvedRequests().length);

  /** Requests still to resolve that were submitted more than 2 days ago. */
  readonly delayedCount = computed(() =>
    this.unresolvedRequests().filter(request => request.waitingHours() > DELAYED_AFTER_HOURS).length);
}
