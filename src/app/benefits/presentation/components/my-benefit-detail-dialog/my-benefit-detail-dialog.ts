import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {BenefitAssignment} from '../../../domain/model/benefit-assignment.entity';
import {BenefitQuantity} from '../benefit-quantity/benefit-quantity';
import {BENEFIT_PERIODICITY_VISIBLE} from '../../utils/benefits-features';

/**
 * Data received by the benefit detail dialog.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export interface MyBenefitDetailData {
  /** Assignment whose detail is shown. */
  assignment: BenefitAssignment;
}

@Component({
  selector: 'app-my-benefit-detail-dialog',
  imports: [MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, LocalDatePipe, BenefitQuantity],
  templateUrl: './my-benefit-detail-dialog.html',
  styleUrl: './my-benefit-detail-dialog.css',
})
/**
 * Shows the detail of one benefit of the signed-in user (WA-27, "Ver detalle"): description,
 * unit, periodicity, validity and assigned quantity. It is read only.
 *
 * @remarks The periodicity is hidden while the web service does not store it
 * (BENEFIT_PERIODICITY_VISIBLE).
 * @author Salym
 */
export class MyBenefitDetailDialog {
  /** Assignment received from the screen that opened the dialog. */
  readonly assignment = inject<MyBenefitDetailData>(MAT_DIALOG_DATA).assignment;
  /** Whether the periodicity is shown; see BENEFIT_PERIODICITY_VISIBLE. */
  readonly showPeriodicity = BENEFIT_PERIODICITY_VISIBLE;
}
