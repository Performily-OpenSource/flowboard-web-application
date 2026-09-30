import {Component, computed, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {formatRequestPeriod} from '../../pipes/request-period-pipe';
import {formatFileSize} from '../../pipes/file-size-pipe';
import {RequesterSummaryCard, SummaryRow} from '../requester-summary-card/requester-summary-card';
import {RequestDialogData} from '../approve-request-dialog/approve-request-dialog';

@Component({
  selector: 'app-reject-request-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, RequesterSummaryCard],
  templateUrl: './reject-request-dialog.html',
  styleUrl: './reject-request-dialog.css',
})
export class RejectRequestDialog {
  readonly store = inject(RequestStore);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<RejectRequestDialog>);
  readonly data = inject<RequestDialogData>(MAT_DIALOG_DATA);

  readonly requester = computed(() => this.store.getRequester(this.data.request.requesterId));

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

  readonly reason = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]
  });

  constructor() {
    this.store.clearError();
  }

  get showReasonError(): boolean {
    return this.reason.invalid && this.reason.touched;
  }

  confirm() {
    this.reason.markAsTouched();
    if (this.reason.invalid) return;
    if (this.store.rejectRequest(this.data.request, this.reason.value)) this.dialogRef.close(true);
  }
}
