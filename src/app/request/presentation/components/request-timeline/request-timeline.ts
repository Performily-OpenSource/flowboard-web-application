import {Component, computed, inject, input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {Request} from '../../../domain/model/request.entity';
import {RequestStore} from '../../../application/request.store';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';

interface TimelineStep {
  label: string;
  date: string | null;
  done: boolean;
}

@Component({
  selector: 'app-request-timeline',
  imports: [DatePipe, TranslatePipe, RequestStatusBadge],
  templateUrl: './request-timeline.html',
  styleUrl: './request-timeline.css',
})
export class RequestTimeline {
  private store = inject(RequestStore);
  readonly request = input.required<Request>();

  readonly steps = computed<TimelineStep[]>(() => {
    const request = this.request();
    const history = request.history;
    const review = [...history].reverse().find(entry => entry.newStatus === 'UNDER_REVIEW') ?? null;
    const resolution = history.find(entry => ['APPROVED', 'REJECTED', 'CANCELLED'].includes(entry.newStatus)) ?? null;
    return [
      { label: 'timeline.sent', date: request.submittedAt, done: true },
      { label: 'timeline.received', date: request.submittedAt, done: true },
      { label: 'timeline.review', date: review?.occurredAt ?? null, done: review !== null },
      {
        label: resolution ? `request-status.${resolution.newStatus}` : 'timeline.resolved',
        date: resolution?.occurredAt ?? null,
        done: resolution !== null
      }
    ];
  });

  readonly history = computed(() => [...this.request().history].reverse());

  actorName(actorId: number): string {
    return this.store.getRequester(actorId)?.fullName ?? '-';
  }
}
