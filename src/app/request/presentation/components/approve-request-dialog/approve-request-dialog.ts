import {Component, computed, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {Request} from '../../../domain/model/request.entity';
import {formatRequestPeriod} from '../../pipes/request-period-pipe';
import {RequesterSummaryCard, SummaryRow} from '../requester-summary-card/requester-summary-card';

export interface RequestDialogData {
  request: Request;
}

@Component({
  selector: 'app-approve-request-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, RequesterSummaryCard],
  templateUrl: './approve-request-dialog.html',
  styleUrl: './approve-request-dialog.css',
})
export class ApproveRequestDialog {
  readonly store = inject(RequestStore);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<ApproveRequestDialog>);
  readonly data = inject<RequestDialogData>(MAT_DIALOG_DATA);

  readonly requester = computed(() => this.store.getRequester(this.data.request.requesterId));
  readonly deductsVacation = computed(() => this.data.request.requestType?.deductsVacationDays() ?? false);

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

  readonly comment = new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(500)] });

  constructor() {
    this.store.clearError();
  }

  confirm() {
    if (this.store.approveRequest(this.data.request, this.comment.value)) this.dialogRef.close(true);
  }
}
