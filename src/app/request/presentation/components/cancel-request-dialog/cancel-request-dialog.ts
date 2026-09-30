import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';
import {RequestDialogData} from '../approve-request-dialog/approve-request-dialog';

@Component({
  selector: 'app-cancel-request-dialog',
  imports: [MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, RequestPeriodPipe],
  templateUrl: './cancel-request-dialog.html',
  styleUrl: './cancel-request-dialog.css',
})
export class CancelRequestDialog {
  readonly store = inject(RequestStore);
  private dialogRef = inject(MatDialogRef<CancelRequestDialog>);
  readonly data = inject<RequestDialogData>(MAT_DIALOG_DATA);

  constructor() {
    this.store.clearError();
  }

  confirm() {
    if (this.store.cancelRequest(this.data.request)) this.dialogRef.close(true);
  }
}
