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
import {RequestDetailAction, RequestDetailData, RequestDetailDialog} from '../../components/request-detail-dialog/request-detail-dialog';
import {CancelRequestDialog} from '../../components/cancel-request-dialog/cancel-request-dialog';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';

/** Tabs of the view: open, resolved or all the requests. */
type MyRequestsTab = 'open' | 'resolved' | 'all';

/**
 * View of the requests of the employee in session (US32, US33).
 * Lists them by tab; clicking one opens a floating window with its detail and timeline, with the options to cancel it or,
 * when it was returned for review, to complete it.
 *
 * @author Diego Alonso Diaz Villalba
 */
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
    RequestPeriodPipe
  ],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests {
  readonly store = inject(RequestStore);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  /** Columns of the table. */
  readonly columns = ['code', 'type', 'period', 'status', 'approver', 'actions'];
  /** Selected tab. */
  readonly tab = signal<MyRequestsTab>('open');

  /** Requests not resolved yet. */
  readonly openRequests = computed(() => this.store.myRequests().filter(request => !request.isResolved()));
  /** Requests already resolved. */
  readonly resolvedRequests = computed(() => this.store.myRequests().filter(request => request.isResolved()));

  /** Requests of the selected tab. */
  readonly visibleRequests = computed(() => {
    switch (this.tab()) {
      case 'open': return this.openRequests();
      case 'resolved': return this.resolvedRequests();
      default: return this.store.myRequests();
    }
  });

  /**
   * Changes the tab.
   *
   * @param tab - The tab to show.
   * @author Diego Alonso Diaz Villalba
   */
  setTab(tab: MyRequestsTab) {
    this.tab.set(tab);
  }

  /**
   * Opens the floating window with the detail and timeline of a request. If the employee chooses to cancel
   * or complete it there, the window closes and that option opens.
   *
   * @param request - The request.
   * @author Diego Alonso Diaz Villalba
   */
  openDetail(request: Request) {
    this.dialog
      .open<RequestDetailDialog, RequestDetailData, RequestDetailAction>(RequestDetailDialog, {
        data: { request, mine: true },
        width: '760px',
        maxWidth: '95vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe(action => {
        if (action === 'cancel') this.cancel(request);
        else if (action === 'complete') this.complete(request);
      });
  }

  /**
   * Gets the name of the manager who resolves a request.
   *
   * @param request - The request.
   * @returns The manager's name, or an empty string when it goes to Human Resources
   * @author Diego Alonso Diaz Villalba
   */
  approverName(request: Request): string {
    return this.store.approverName(request) ?? '';
  }

  /**
   * Opens the dialog to cancel a request.
   *
   * @param request - The request to cancel.
   * @author Diego Alonso Diaz Villalba
   */
  cancel(request: Request) {
    this.dialog.open(CancelRequestDialog, { data: { request }, width: '520px', maxWidth: '95vw' });
  }

  /**
   * Opens the request form to complete a request returned for review.
   *
   * @param request - The request to complete.
   * @author Diego Alonso Diaz Villalba
   */
  complete(request: Request) {
    this.router.navigate(['/requests/my-requests', request.id, 'complete']).then();
  }
}
