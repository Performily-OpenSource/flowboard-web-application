import {Component, effect, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';

/** Time the success message stays on screen, in milliseconds. */
const NOTICE_DURATION = 5000;

@Component({
  selector: 'app-benefits-feedback',
  imports: [MatIcon, MatProgressBar, TranslatePipe],
  templateUrl: './benefits-feedback.html',
  styleUrl: './benefits-feedback.css',
})
/**
 * Shows the loading bar, the business rule or API errors of the benefits store and a snackbar
 * with the result of every action (created, assigned, delivered, cancelled...), with "Undo"
 * when the action can be reverted.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitsFeedback {
  readonly store = inject(BenefitsStore);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  /** Shows each success message of the store once. */
  constructor() {
    effect(() => {
      const notice = this.store.notice();
      if (!notice) return;
      this.store.clearNotice();
      const message = this.translate.instant(notice.key, notice.params);
      const action = notice.undo ? this.translate.instant('benefits.notice.undo') : undefined;
      const snack = this.snackBar.open(message, action, { duration: NOTICE_DURATION });
      if (notice.undo) snack.onAction().subscribe(() => notice.undo!());
    });
  }
}
