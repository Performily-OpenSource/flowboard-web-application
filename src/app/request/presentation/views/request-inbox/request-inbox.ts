import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatDialog} from '@angular/material/dialog';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {Request} from '../../../domain/model/request.entity';
import {RequestStatusBadge} from '../../components/request-status-badge/request-status-badge';
import {RequestTimeline} from '../../components/request-timeline/request-timeline';
import {ApproveRequestDialog} from '../../components/approve-request-dialog/approve-request-dialog';
import {RejectRequestDialog} from '../../components/reject-request-dialog/reject-request-dialog';
import {ReturnRequestDialog} from '../../components/return-request-dialog/return-request-dialog';
import {RelativeTimePipe} from '../../pipes/relative-time-pipe';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';

/** Tabs of the inbox: pending, under review, resolved or all. */
type InboxTab = 'pending' | 'review' | 'resolved' | 'all';
/** Filter by the time a request has been waiting. */
type AgeFilter = 'over-2-days' | 'over-7-days' | 'today';

/** Requests per page. */
const PAGE_SIZE = 8;
/** Age filters in the order they are shown. */
const AGE_FILTERS: AgeFilter[] = ['today', 'over-2-days', 'over-7-days'];

/**
 * Inbox of Human Resources (US31): requests of every other employee by tab, with filters by type,
 * area and waiting time, pagination, the detail of each request and the actions to approve, reject
 * or return it for review.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-request-inbox',
  imports: [
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    MatTooltip,
    TranslatePipe,
    RequestStatusBadge,
    RequestTimeline,
    RelativeTimePipe,
    RequestPeriodPipe
  ],
  templateUrl: './request-inbox.html',
  styleUrl: './request-inbox.css',
})
export class RequestInbox {
  readonly store = inject(RequestStore);
  private dialog = inject(MatDialog);

  /** Columns of the table. */
  readonly columns = ['requester', 'type', 'period', 'status', 'submittedAt', 'actions'];
  /** Age filters shown. */
  readonly ageFilters = AGE_FILTERS;

  /** Selected tab. */
  readonly tab = signal<InboxTab>('pending');
  /** Selected request type, or null for all. */
  readonly typeFilter = signal<number | null>(null);
  /** Selected area, or null for all. */
  readonly areaFilter = signal<number | null>(null);
  /** Selected waiting time, or null for any. */
  readonly ageFilter = signal<AgeFilter | null>(null);
  /** Current page, starting at 0. */
  readonly page = signal(0);
  /** Request whose detail is open, or null. */
  readonly selectedId = signal<number | null>(null);

  /** Pending requests. */
  readonly pending = computed(() => this.store.inboxRequests().filter(request => request.isPending()));
  /** Requests returned for review. */
  readonly underReview = computed(() => this.store.inboxRequests().filter(request => request.isUnderReview()));
  /** Resolved requests. */
  readonly resolved = computed(() => this.store.inboxRequests().filter(request => request.isResolved()));
  /** Number of pending requests waiting more than 2 days. */
  readonly waitingOverTwoDays = computed(() => this.pending().filter(request => request.waitingHours() > 48).length);

  /** Areas of the requesters, for the area filter. */
  readonly areas = computed(() => {
    const areas = new Map<number, string>();
    this.store.inboxRequests().forEach(request => {
      const requester = this.store.getRequester(request.requesterId);
      if (requester) areas.set(requester.areaId, requester.areaName);
    });
    return [...areas.entries()].map(([id, name]) => ({ id, name }));
  });

  /** Requests of the selected tab. */
  readonly tabRequests = computed(() => {
    switch (this.tab()) {
      case 'pending': return this.pending();
      case 'review': return this.underReview();
      case 'resolved': return this.resolved();
      default: return this.store.inboxRequests();
    }
  });

  /** Requests of the tab that match the filters; resolved ones newest first, the rest oldest first. */
  readonly filteredRequests = computed(() => this.tabRequests()
    .filter(request =>
      (this.typeFilter() === null || request.requestTypeId === this.typeFilter()) &&
      (this.areaFilter() === null || this.store.getRequester(request.requesterId)?.areaId === this.areaFilter()) &&
      this.matchesAge(request))
    .sort((a, b) => this.tab() === 'resolved' ? b.lastUpdatedAt.localeCompare(a.lastUpdatedAt) : a.submittedAt.localeCompare(b.submittedAt)));

  /** Whether any filter is applied. */
  readonly hasFilters = computed(() => this.typeFilter() !== null || this.areaFilter() !== null || this.ageFilter() !== null);
  /** Number of pages, at least 1. */
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredRequests().length / PAGE_SIZE)));
  /** Page indexes for the paginator. */
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index));
  /** Requests of the current page. */
  readonly pageRequests = computed(() => this.filteredRequests().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  /** Position of the first request of the page, starting at 1. */
  readonly rangeStart = computed(() => this.filteredRequests().length === 0 ? 0 : this.page() * PAGE_SIZE + 1);
  /** Position of the last request of the page. */
  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredRequests().length));

  /** Request whose detail is open, or null. */
  readonly selectedRequest = computed(() => this.store.inboxRequests().find(request => request.id === this.selectedId()) ?? null);

  /**
   * Changes the tab and goes back to the first page.
   *
   * @param tab - The tab to show.
   * @author Diego Alonso Diaz Villalba
   */
  setTab(tab: InboxTab) {
    this.tab.set(tab);
    this.page.set(0);
  }

  /**
   * Filters by request type and goes back to the first page.
   *
   * @param typeId - The request type, or null for all.
   * @author Diego Alonso Diaz Villalba
   */
  setType(typeId: number | null) {
    this.typeFilter.set(typeId);
    this.page.set(0);
  }

  /**
   * Filters by area and goes back to the first page.
   *
   * @param areaId - The area, or null for all.
   * @author Diego Alonso Diaz Villalba
   */
  setArea(areaId: number | null) {
    this.areaFilter.set(areaId);
    this.page.set(0);
  }

  /**
   * Filters by waiting time and goes back to the first page.
   *
   * @param age - The waiting time, or null for any.
   * @author Diego Alonso Diaz Villalba
   */
  setAge(age: AgeFilter | null) {
    this.ageFilter.set(age);
    this.page.set(0);
  }

  /**
   * Removes every filter and goes back to the first page.
   *
   * @author Diego Alonso Diaz Villalba
   */
  clearFilters() {
    this.typeFilter.set(null);
    this.areaFilter.set(null);
    this.ageFilter.set(null);
    this.page.set(0);
  }

  /**
   * Gets the name of a request type.
   *
   * @param typeId - The request type identifier.
   * @returns The name, or an empty string if not found
   * @author Diego Alonso Diaz Villalba
   */
  typeName(typeId: number): string {
    return this.store.getRequestTypeById(typeId)()?.name ?? '';
  }

  /**
   * Gets the name of an area of the filter.
   *
   * @param areaId - The area identifier.
   * @returns The name, or an empty string if not found
   * @author Diego Alonso Diaz Villalba
   */
  areaName(areaId: number): string {
    return this.areas().find(area => area.id === areaId)?.name ?? '';
  }

  /**
   * Gets the employee who submitted a request.
   *
   * @param request - The request.
   * @returns The requester, or null if not found
   * @author Diego Alonso Diaz Villalba
   */
  requesterOf(request: Request) {
    return this.store.getRequester(request.requesterId);
  }

  /**
   * Opens or closes the detail of a request.
   *
   * @param request - The request.
   * @author Diego Alonso Diaz Villalba
   */
  toggleDetail(request: Request) {
    this.selectedId.set(this.selectedId() === request.id ? null : request.id);
  }

  /**
   * Opens the dialog to approve a request.
   *
   * @param request - The request.
   * @author Diego Alonso Diaz Villalba
   */
  approve(request: Request) {
    this.dialog.open(ApproveRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

  /**
   * Opens the dialog to reject a request.
   *
   * @param request - The request.
   * @author Diego Alonso Diaz Villalba
   */
  reject(request: Request) {
    this.dialog.open(RejectRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

  /**
   * Opens the dialog to return a request for review.
   *
   * @param request - The request.
   * @author Diego Alonso Diaz Villalba
   */
  returnForReview(request: Request) {
    this.dialog.open(ReturnRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

  /**
   * Checks whether a request matches the waiting time filter.
   *
   * @param request - The request.
   * @returns True if it matches or there is no filter, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  private matchesAge(request: Request): boolean {
    const hours = request.waitingHours();
    switch (this.ageFilter()) {
      case 'today': return hours <= 24;
      case 'over-2-days': return hours > 48;
      case 'over-7-days': return hours > 168;
      default: return true;
    }
  }
}
