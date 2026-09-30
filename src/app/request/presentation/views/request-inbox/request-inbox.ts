import {Component, computed, effect, inject, signal} from '@angular/core';
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
import {ActingEmployeeSelector} from '../../components/acting-employee-selector/acting-employee-selector';
import {ApproveRequestDialog} from '../../components/approve-request-dialog/approve-request-dialog';
import {RejectRequestDialog} from '../../components/reject-request-dialog/reject-request-dialog';
import {ReturnRequestDialog} from '../../components/return-request-dialog/return-request-dialog';
import {RelativeTimePipe} from '../../pipes/relative-time-pipe';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';

type InboxTab = 'pending' | 'review' | 'resolved' | 'all';
type AgeFilter = 'over-2-days' | 'over-7-days' | 'today';

const PAGE_SIZE = 8;
const AGE_FILTERS: AgeFilter[] = ['today', 'over-2-days', 'over-7-days'];

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
    ActingEmployeeSelector,
    RelativeTimePipe,
    RequestPeriodPipe
  ],
  templateUrl: './request-inbox.html',
  styleUrl: './request-inbox.css',
})
export class RequestInbox {
  readonly store = inject(RequestStore);
  private dialog = inject(MatDialog);

  readonly columns = ['requester', 'type', 'period', 'status', 'submittedAt', 'actions'];
  readonly ageFilters = AGE_FILTERS;

  readonly tab = signal<InboxTab>('pending');
  readonly typeFilter = signal<number | null>(null);
  readonly areaFilter = signal<number | null>(null);
  readonly ageFilter = signal<AgeFilter | null>(null);
  readonly page = signal(0);
  readonly selectedId = signal<number | null>(null);

  readonly pending = computed(() => this.store.inboxRequests().filter(request => request.isPending()));
  readonly underReview = computed(() => this.store.inboxRequests().filter(request => request.isUnderReview()));
  readonly resolved = computed(() => this.store.inboxRequests().filter(request => request.isResolved()));
  readonly waitingOverTwoDays = computed(() => this.pending().filter(request => request.waitingHours() > 48).length);

  readonly areas = computed(() => {
    const areas = new Map<number, string>();
    this.store.inboxRequests().forEach(request => {
      const requester = this.store.getRequester(request.requesterId);
      if (requester) areas.set(requester.areaId, requester.areaName);
    });
    return [...areas.entries()].map(([id, name]) => ({ id, name }));
  });

  readonly tabRequests = computed(() => {
    switch (this.tab()) {
      case 'pending': return this.pending();
      case 'review': return this.underReview();
      case 'resolved': return this.resolved();
      default: return this.store.inboxRequests();
    }
  });

  readonly filteredRequests = computed(() => this.tabRequests()
    .filter(request =>
      (this.typeFilter() === null || request.requestTypeId === this.typeFilter()) &&
      (this.areaFilter() === null || this.store.getRequester(request.requesterId)?.areaId === this.areaFilter()) &&
      this.matchesAge(request))
    .sort((a, b) => this.tab() === 'resolved' ? b.lastUpdatedAt.localeCompare(a.lastUpdatedAt) : a.submittedAt.localeCompare(b.submittedAt)));

  readonly hasFilters = computed(() => this.typeFilter() !== null || this.areaFilter() !== null || this.ageFilter() !== null);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredRequests().length / PAGE_SIZE)));
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index));
  readonly pageRequests = computed(() => this.filteredRequests().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  readonly rangeStart = computed(() => this.filteredRequests().length === 0 ? 0 : this.page() * PAGE_SIZE + 1);
  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredRequests().length));

  readonly selectedRequest = computed(() => this.store.inboxRequests().find(request => request.id === this.selectedId()) ?? null);

  constructor() {
    effect(() => {
      this.store.actingEmployeeId();
      this.selectedId.set(null);
      this.page.set(0);
    });
  }

  setTab(tab: InboxTab) {
    this.tab.set(tab);
    this.page.set(0);
  }

  setType(typeId: number | null) {
    this.typeFilter.set(typeId);
    this.page.set(0);
  }

  setArea(areaId: number | null) {
    this.areaFilter.set(areaId);
    this.page.set(0);
  }

  setAge(age: AgeFilter | null) {
    this.ageFilter.set(age);
    this.page.set(0);
  }

  clearFilters() {
    this.typeFilter.set(null);
    this.areaFilter.set(null);
    this.ageFilter.set(null);
    this.page.set(0);
  }

  typeName(typeId: number): string {
    return this.store.getRequestTypeById(typeId)()?.name ?? '';
  }

  areaName(areaId: number): string {
    return this.areas().find(area => area.id === areaId)?.name ?? '';
  }

  requesterOf(request: Request) {
    return this.store.getRequester(request.requesterId);
  }

  toggleDetail(request: Request) {
    this.selectedId.set(this.selectedId() === request.id ? null : request.id);
  }

  approve(request: Request) {
    this.dialog.open(ApproveRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

  reject(request: Request) {
    this.dialog.open(RejectRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

  returnForReview(request: Request) {
    this.dialog.open(ReturnRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

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
