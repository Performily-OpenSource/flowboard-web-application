import {Component, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitTypeFormDialog} from '../benefit-type-form-dialog/benefit-type-form-dialog';
import {AssignBenefitDialog} from '../assign-benefit-dialog/assign-benefit-dialog';

@Component({
  selector: 'app-benefits-header',
  imports: [MatButton, MatIcon, TranslatePipe],
  templateUrl: './benefits-header.html',
})
/**
 * Shows the title and the main actions of the Benefits screen (WA-25).
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitsHeader {
  private dialog = inject(MatDialog);

  /**
   * Opens the dialog to create a benefit (WA-28).
   * @author Salym
   */
  openNewBenefit() {
    this.dialog.open(BenefitTypeFormDialog, { data: {}, width: '540px', maxWidth: '95vw' });
  }

  /**
   * Opens the dialog to assign a benefit (WA-29).
   * @author Salym
   */
  openAssignBenefit() {
    this.dialog.open(AssignBenefitDialog, { data: {}, width: '560px', maxWidth: '95vw' });
  }
}
