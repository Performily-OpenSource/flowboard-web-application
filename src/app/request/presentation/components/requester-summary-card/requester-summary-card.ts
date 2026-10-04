import {Component, input} from '@angular/core';
import {Requester} from '../../../domain/model/requester.entity';

/**
 * Label and value shown in the summary of a request.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface SummaryRow {
  /** Translated label. */
  label: string;
  /** Value shown. */
  value: string;
}

/**
 * Summary of a request used by the approve, reject and return dialogs:
 * the requester with its position and area, followed by label and value rows.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-requester-summary-card',
  imports: [],
  templateUrl: './requester-summary-card.html',
  styleUrl: './requester-summary-card.css',
})
export class RequesterSummaryCard {
  /** The employee who submitted the request. */
  readonly requester = input.required<Requester | null>();
  /** Rows to show under the requester. */
  readonly rows = input<SummaryRow[]>([]);
}
