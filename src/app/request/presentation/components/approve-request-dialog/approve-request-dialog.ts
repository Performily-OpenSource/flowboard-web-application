import {Component, computed, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {RequestStore} from '../../../application/request.store';
import {Request} from '../../../domain/model/request.entity';
import {formatRequestPeriod} from '../../pipes/request-period-pipe';
import {RequesterSummaryCard, SummaryRow} from '../requester-summary-card/requester-summary-card';

/**
 * Data received by the dialogs that act on a request.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestDialogData {
  /** The request to act on. */
  request: Request;
}

/**
 * Dialog to approve a pending request (US31).
 * Shows the requester, the type and period, and for vacation requests the balance before and after,
 * with an optional comment.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-approve-request-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, RequesterSummaryCard],
  templateUrl: './approve-request-dialog.html',
  styleUrl: './approve-request-dialog.css',
})
export class ApproveRequestDialog extends BaseForm {
  private fb = inject(FormBuilder);
  readonly store = inject(RequestStore);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<ApproveRequestDialog>);
  readonly data = inject<RequestDialogData>(MAT_DIALOG_DATA);

  /** The employee who submitted the request. */
  readonly requester = computed(() => this.store.getRequester(this.data.request.requesterId));
  /** Whether the request type deducts vacation days. */
  readonly deductsVacation = computed(() => this.data.request.requestType?.deductsVacationDays() ?? false);

  /** Summary rows: type, period and, for vacations, requested days and balance. */
  readonly rows = computed<SummaryRow[]>(() => {
    const request = this.data.request;
    const rows: SummaryRow[] = [
      { label: this.translate.instant('request-dialog.type'), value: request.requestType?.name ?? '-' },
      { label: this.translate.instant('request-dialog.period'), value: formatRequestPeriod(request, 'long', this.translate) }
    ];
    const balance = this.store.getVacationBalance(request.requesterId);
    if (this.deductsVacation() && balance) {
      const days = request.requestedDays();
      rows.push(
        { label: this.translate.instant('request-dialog.requested-days'), value: this.translate.instant('request-period.working-days', { count: days }) },
        { label: this.translate.instant('request-dialog.available-balance'), value: this.translate.instant('request-period.days', { count: balance.availableDays }) },
        { label: this.translate.instant('request-dialog.balance-after'), value: this.translate.instant('request-period.days', { count: balance.availableAfter(days) }) }
      );
    }
    return rows;
  });

  /** Form with the optional comment of the approver (up to 500 characters). */
  readonly form = this.fb.group({
    comment: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(500)] })
  });

  /**
   * Creates the dialog and clears the previous error of the store.
   *
   * @author Diego Alonso Diaz Villalba
   */
  constructor() {
    super();
    this.store.clearError();
  }

  /**
   * Approves the request and closes the dialog when the change is sent.
   *
   * @author Diego Alonso Diaz Villalba
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.store.approveRequest(this.data.request, this.form.controls.comment.value)) this.dialogRef.close(true);
  }
}
