import {Component, computed, inject, input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {Request} from '../../../domain/model/request.entity';
import {RequestStore} from '../../../application/request.store';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';

/**
 * Step of the timeline of a request.
 *
 * @author Diego Alonso Diaz Villalba
 */
interface TimelineStep {
  /** Translation key of the step. */
  label: string;
  /** Date when the step happened, or null. */
  date: string | null;
  /** Whether the step already happened. */
  done: boolean;
}

/**
 * Timeline of a request: sent, received, under review and resolved, followed by its history
 * of status changes with the employee who made each one.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-request-timeline',
  imports: [DatePipe, TranslatePipe, RequestStatusBadge],
  templateUrl: './request-timeline.html',
  styleUrl: './request-timeline.css',
})
export class RequestTimeline {
  private store = inject(RequestStore);
  /** The request to show. */
  readonly request = input.required<Request>();

  /** The 4 steps of the request; the last one shows how it was resolved. */
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

  /** Status changes, newest first. */
  readonly history = computed(() => [...this.request().history].reverse());

  /**
   * Gets the name of the employee who made a change.
   *
   * @param actorId - The employee identifier.
   * @returns The full name, or '-' if not found
   * @author Diego Alonso Diaz Villalba
   */
  actorName(actorId: number): string {
    return this.store.getRequester(actorId)?.fullName ?? '-';
  }
}
