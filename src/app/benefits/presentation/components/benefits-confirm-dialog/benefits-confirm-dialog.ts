import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

/**
 * Data received by the confirmation dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitsConfirmData {
  /** i18n key of the title. */
  titleKey: string;
  /** i18n key of the message. */
  messageKey: string;
  /** Values used by the title and the message. */
  params?: Record<string, unknown>;
  /** i18n key of the confirm button. */
  confirmKey: string;
  /** i18n key of the cancel button; "Cancel" by default. */
  cancelKey?: string;
  /** Whether the action deletes or cancels something; shows the confirm button in red. */
  danger?: boolean;
}

@Component({
  selector: 'app-benefits-confirm-dialog',
  imports: [MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe],
  templateUrl: './benefits-confirm-dialog.html',
  styleUrl: './benefits-confirm-dialog.css',
})
/**
 * Asks the user to confirm an action that changes data and is hard to undo, such as cancelling an
 * assignment, deactivating a benefit or discarding the changes of a form. It closes with true when
 * the user confirms.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitsConfirmDialog {
  /** Texts and style of the dialog. */
  readonly data = inject<BenefitsConfirmData>(MAT_DIALOG_DATA);
}
