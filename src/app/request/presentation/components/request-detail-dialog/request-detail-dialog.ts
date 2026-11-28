import {Component, computed, inject} from '@angular/core';
import {formatDate} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {formatRequestPeriod} from '../../pipes/request-period-pipe';
import {FileSizePipe} from '../../pipes/file-size-pipe';
import {RequestDialogData} from '../approve-request-dialog/approve-request-dialog';
import {RequestStatusBadge} from '../request-status-badge/request-status-badge';
import {RequestTimeline} from '../request-timeline/request-timeline';
import {RequesterSummaryCard, SummaryRow} from '../requester-summary-card/requester-summary-card';

/** Action chosen in the detail; the view that opened it opens the matching dialog. */
export type RequestDetailAction = 'approve' | 'reject' | 'return' | 'cancel' | 'complete';

/**
 * Data received by the detail window.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestDetailData extends RequestDialogData {
  /** True when the employee in session opens his own request (shows cancel and complete instead of approve and reject). */
  mine?: boolean;
}

/**
 * Floating window with the detail of a request: requester, period, approver, field values, attachments,
 * timeline with its history, and the buttons to approve, reject or return it (or to cancel or complete it, when it is the
 * employee's own request).
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-request-detail-dialog',
  imports: [
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslatePipe,
    FileSizePipe,
    RequestStatusBadge,
    RequestTimeline,
    RequesterSummaryCard
  ],
  templateUrl: './request-detail-dialog.html',
  styleUrl: './request-detail-dialog.css',
})
export class RequestDetailDialog {
  readonly store = inject(RequestStore);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<RequestDetailDialog, RequestDetailAction>);
  readonly data = inject<RequestDetailData>(MAT_DIALOG_DATA);
  /** Whether the request belongs to the employee in session. */
  readonly mine = this.data.mine ?? false;

  /** The employee who submitted the request. */
  readonly requester = computed(() => this.store.getRequester(this.data.request.requesterId));

  /** Summary rows: type, period, requested days, approver and submission date. */
  readonly rows = computed<SummaryRow[]>(() => {
    const request = this.data.request;
    const rows: SummaryRow[] = [
      { label: this.translate.instant('request-dialog.type'), value: request.requestType?.name ?? '-' },
      { label: this.translate.instant('request-dialog.period'), value: formatRequestPeriod(request, 'long', this.translate) }
    ];
    if (request.requestedDays() > 0 && !request.hasTimes()) {
      rows.push({
        label: this.translate.instant('request-dialog.requested-days'),
        value: this.translate.instant('request-period.calendar-days', { count: request.requestedDays() })
      });
    }
    rows.push(
      {
        label: this.translate.instant('request-detail.approver'),
        value: this.store.approverName(request) ?? this.translate.instant('request-detail.approver-hr')
      },
      {
        label: this.translate.instant('request-detail.submitted'),
        value: formatDate(request.submittedAt, 'dd/MM/yyyy, HH:mm', 'en-US')
      }
    );
    return rows;
  });

  /** Values entered for the fields of the request type, with their label. */
  readonly fields = computed(() => {
    const request = this.data.request;
    return (request.requestType?.fields ?? [])
      .map(field => ({ label: field.label, value: request.fieldValue(field.key) }))
      .filter(field => field.value !== null && field.value !== '');
  });

  /**
   * Explains why a pending request cannot be resolved by the employee in session.
   *
   * @returns The translation key and its values, or null when the request is not pending or can be resolved
   * @author Diego Alonso Diaz Villalba
   */
  readOnlyNotice(): { key: string; params: Record<string, unknown> } | null {
    const request = this.data.request;
    if (this.mine || !request.isPending() || this.store.canResolve(request)) return null;
    if (request.isRoutedToHr()) return { key: 'inbox.read-only-hr', params: {} };
    return { key: 'inbox.read-only-manager', params: { name: this.store.approverName(request) ?? '-' } };
  }

  /**
   * Closes the window and tells the inbox which action to open.
   *
   * @param action - The action chosen.
   * @author Diego Alonso Diaz Villalba
   */
  choose(action: RequestDetailAction) {
    this.dialogRef.close(action);
  }
}
