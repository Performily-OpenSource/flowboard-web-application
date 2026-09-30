import {Component, input} from '@angular/core';
import {Requester} from '../../../domain/model/requester.entity';

export interface SummaryRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-requester-summary-card',
  imports: [],
  templateUrl: './requester-summary-card.html',
  styleUrl: './requester-summary-card.css',
})
export class RequesterSummaryCard {
  readonly requester = input.required<Requester | null>();
  readonly rows = input<SummaryRow[]>([]);
}
