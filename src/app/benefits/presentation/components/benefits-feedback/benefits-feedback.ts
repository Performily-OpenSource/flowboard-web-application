import {Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';

@Component({
  selector: 'app-benefits-feedback',
  imports: [MatIcon, MatProgressBar, TranslatePipe],
  templateUrl: './benefits-feedback.html',
  styleUrl: './benefits-feedback.css',
})
/**
 * Shows the loading bar and the business rule or API errors of the benefits store.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitsFeedback {
  readonly store = inject(BenefitsStore);
}
