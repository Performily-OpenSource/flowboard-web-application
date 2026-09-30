import {Component, computed, inject, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';


const LATEST_COUNT = 3;

@Component({
  selector: 'app-latest-requests-card',
  imports: [RouterLink, TranslatePipe, RequestStatusBadge, RequestPeriodPipe],
  templateUrl: './latest-requests-card.html',
  styleUrl: './latest-requests-card.css',
})
export class LatestRequestsCard {
  private readonly store = inject(RequestStore);

  readonly employeeId = input.required<number>();

  readonly requests = computed(() => this.store.requestsOf(this.employeeId()));
  readonly latest = computed(() => this.requests().slice(0, LATEST_COUNT));
}
