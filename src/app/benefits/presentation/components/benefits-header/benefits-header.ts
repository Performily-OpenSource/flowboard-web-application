import {Component, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitTypeFormDialog} from '../benefit-type-form-dialog/benefit-type-form-dialog';
import {AssignBenefitDialog} from '../assign-benefit-dialog/assign-benefit-dialog';

/** Title and main actions of the Benefits screen (WA-25). */
@Component({
  selector: 'app-benefits-header',
  imports: [MatButton, MatIcon, TranslatePipe],
  templateUrl: './benefits-header.html',
})
export class BenefitsHeader {
  private dialog = inject(MatDialog);

  openNewBenefit() {
    this.dialog.open(BenefitTypeFormDialog, { data: {}, width: '540px', maxWidth: '95vw' });
  }

  openAssignBenefit() {
    this.dialog.open(AssignBenefitDialog, { data: {}, width: '560px', maxWidth: '95vw' });
  }
}
