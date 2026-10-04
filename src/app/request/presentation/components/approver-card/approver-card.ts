import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Requester} from '../../../domain/model/requester.entity';

/**
 * Card of the request form that shows who will resolve the request:
 * the direct manager, or Human Resources when there is none.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-approver-card',
  imports: [TranslatePipe],
  templateUrl: './approver-card.html',
  styleUrl: './approver-card.css',
})
export class ApproverCard {
  /** The direct manager, or null when the request goes to Human Resources. */
  readonly manager = input<Requester | null>(null);
}
