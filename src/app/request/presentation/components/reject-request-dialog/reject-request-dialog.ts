import {Component, computed, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {RequestStore} from '../../../application/request.store';
import {formatRequestPeriod} from '../../pipes/request-period-pipe';
import {formatFileSize} from '../../pipes/file-size-pipe';
import {RequesterSummaryCard, SummaryRow} from '../requester-summary-card/requester-summary-card';
import {RequestDialogData} from '../approve-request-dialog/approve-request-dialog';

/**
 * Dialog to reject a pending request (US31).
 * Shows the requester, the type, the period and the attachments, and asks for the reason.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-reject-request-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, RequesterSummaryCard],
  templateUrl: './reject-request-dialog.html',
  styleUrl: './reject-request-dialog.css',
})
export class RejectRequestDialog extends BaseForm {
  private fb = inject(FormBuilder);
  readonly store = inject(RequestStore);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<RejectRequestDialog>);
  readonly data = inject<RequestDialogData>(MAT_DIALOG_DATA);

  /** The employee who submitted the request. */
  readonly requester = computed(() => this.store.getRequester(this.data.request.requesterId));

  /** Summary rows: type, period and one row per attached file. */
  readonly rows = computed<SummaryRow[]>(() => {
    const request = this.data.request;
    const rows: SummaryRow[] = [
      { label: this.translate.instant('request-dialog.type'), value: request.requestType?.name ?? '-' },
      { label: this.translate.instant('request-dialog.period'), value: formatRequestPeriod(request, 'long', this.translate) }
    ];
    request.attachments.forEach(file => rows.push({
      label: this.translate.instant('request-dialog.attachment'),
      value: `${file.fileName} · ${formatFileSize(file.sizeInBytes)}`
    }));
    return rows;
  });

  /** Form with the required reason (up to 500 characters, not only spaces). */
  readonly form = this.fb.group({
    reason: new FormControl<string>('', {
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
   * Rejects the request and closes the dialog when the change is sent.
   *
   * @author Diego Alonso Diaz Villalba
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.store.rejectRequest(this.data.request, this.form.controls.reason.value)) this.dialogRef.close(true);
  }
}
