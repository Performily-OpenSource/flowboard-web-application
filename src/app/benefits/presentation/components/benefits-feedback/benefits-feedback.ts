import {Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';

/** Loading bar and business-rule / API errors of the benefits store. */
@Component({
  selector: 'app-benefits-feedback',
  imports: [MatIcon, MatProgressBar, TranslatePipe],
  templateUrl: './benefits-feedback.html',
  styleUrl: './benefits-feedback.css',
})
export class BenefitsFeedback {
  readonly store = inject(BenefitsStore);
}
