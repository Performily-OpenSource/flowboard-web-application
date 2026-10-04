import {Component, computed, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {RequestStore} from '../../../application/request.store';
import {formatRequestPeriod} from '../../pipes/request-period-pipe';
import {RequesterSummaryCard, SummaryRow} from '../requester-summary-card/requester-summary-card';
import {RequestDialogData} from '../approve-request-dialog/approve-request-dialog';

/**
 * Dialog to return a pending request to the employee so they complete it.
 * Asks for a comment that says what is missing.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-return-request-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, RequesterSummaryCard],
  templateUrl: './return-request-dialog.html',
  styleUrl: './return-request-dialog.css',
})
export class ReturnRequestDialog extends BaseForm {
  private fb = inject(FormBuilder);
  readonly store = inject(RequestStore);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<ReturnRequestDialog>);
  readonly data = inject<RequestDialogData>(MAT_DIALOG_DATA);

  /** The employee who submitted the request. */
  readonly requester = computed(() => this.store.getRequester(this.data.request.requesterId));

  /** Summary rows: type, period and current status. */
  readonly rows = computed<SummaryRow[]>(() => [
    { label: this.translate.instant('request-dialog.type'), value: this.data.request.requestType?.name ?? '-' },
    { label: this.translate.instant('request-dialog.period'), value: formatRequestPeriod(this.data.request, 'long', this.translate) },
    { label: this.translate.instant('request-dialog.current-status'), value: this.translate.instant(`request-status.${this.data.request.status}`) }
  ]);

  /** Form with the required comment (up to 500 characters, not only spaces). */
  readonly form = this.fb.group({
    comment: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]
    })
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
   * Returns the request for review and closes the dialog when the change is sent.
   *
   * @author Diego Alonso Diaz Villalba
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.store.returnRequestForReview(this.data.request, this.form.controls.comment.value)) this.dialogRef.close(true);
  }
}
