import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestPeriodPipe} from '../../pipes/request-period-pipe';
import {RequestDialogData} from '../approve-request-dialog/approve-request-dialog';

/**
 * Dialog to confirm the cancellation of a request by its employee (US33).
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-cancel-request-dialog',
  imports: [MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, RequestPeriodPipe],
  templateUrl: './cancel-request-dialog.html',
  styleUrl: './cancel-request-dialog.css',
})
export class CancelRequestDialog {
  readonly store = inject(RequestStore);
  private dialogRef = inject(MatDialogRef<CancelRequestDialog>);
  /** The request to cancel. */
  readonly data = inject<RequestDialogData>(MAT_DIALOG_DATA);

  /**
   * Creates the dialog and clears the previous error of the store.
   *
   * @author Diego Alonso Diaz Villalba
   */
  constructor() {
    this.store.clearError();
  }

  /**
   * Cancels the request and closes the dialog when the change is sent.
   *
   * @author Diego Alonso Diaz Villalba
   */
  confirm() {
    if (this.store.cancelRequest(this.data.request)) this.dialogRef.close(true);
  }
}
