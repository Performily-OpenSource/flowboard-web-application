import {Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
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
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {Request} from '../../../domain/model/request.entity';
import {RequestStatusBadge} from '../../components/request-status-badge/request-status-badge';
import {RequestTimeline} from '../../components/request-timeline/request-timeline';
import {CancelRequestDialog} from '../../components/cancel-request-dialog/cancel-request-dialog';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';

type MyRequestsTab = 'open' | 'resolved' | 'all';

@Component({
  selector: 'app-my-requests',
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
    TranslatePipe,
    RequestStatusBadge,
    RequestTimeline,
    RequestPeriodPipe
  ],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests {
  readonly store = inject(RequestStore);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  readonly columns = ['code', 'type', 'period', 'status', 'approver', 'actions'];
  readonly tab = signal<MyRequestsTab>('open');
  readonly selectedId = signal<number | null>(null);

  readonly openRequests = computed(() => this.store.myRequests().filter(request => !request.isResolved()));
  readonly resolvedRequests = computed(() => this.store.myRequests().filter(request => request.isResolved()));

  readonly visibleRequests = computed(() => {
    switch (this.tab()) {
      case 'open': return this.openRequests();
      case 'resolved': return this.resolvedRequests();
      default: return this.store.myRequests();
    }
  });

  readonly selectedRequest = computed(() => {
    const visible = this.visibleRequests();
    return visible.find(request => request.id === this.selectedId()) ?? visible.at(0) ?? null;
  });

  setTab(tab: MyRequestsTab) {
    this.tab.set(tab);
    this.selectedId.set(null);
  }

  select(request: Request) {
    this.selectedId.set(request.id);
  }

  approverName(request: Request): string {
    return this.store.approverName(request) ?? '';
  }

  cancel(request: Request) {
    this.dialog.open(CancelRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

  complete(request: Request) {
    this.router.navigate(['/requests/my-requests', request.id, 'complete']).then();
  }
}
