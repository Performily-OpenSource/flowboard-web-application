import {Component, computed, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';
import {RelativeTimePipe} from '../../pipes/relative-time-pipe';

/** Rows shown by the card. */
const VISIBLE_COUNT = 5;

/**
 * "Requests to attend" card of the HR dashboard (WA-02), registered in DASHBOARD_WIDGETS
 * for the 'hr' dashboard in the 'column-1' slot. Lists the inbox requests still to resolve,
 * newest first, and fills the remaining rows with the most recent resolved ones.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-requests-to-attend-card',
  imports: [RouterLink, DatePipe, TranslatePipe, RequestStatusBadge, RequestPeriodPipe, RelativeTimePipe],
  templateUrl: './requests-to-attend-card.html',
  styleUrl: './requests-to-attend-card.css',
})
export class RequestsToAttendCard {
  private readonly store = inject(RequestStore);

  /** Up to 5 inbox requests (unresolved first, then resolved), each with its requester. */
  readonly rows = computed(() => {
    const requests = this.store.inboxRequests();
    const unresolved = requests.filter(request => !request.isResolved());
    const resolved = requests.filter(request => request.isResolved());
    return [...unresolved, ...resolved]
      .slice(0, VISIBLE_COUNT)
      .map(request => ({ request, requester: this.store.getRequester(request.requesterId) }));
  });
}
