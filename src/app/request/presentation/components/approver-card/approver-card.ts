import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Requester} from '../../../domain/model/requester.entity';

@Component({
  selector: 'app-approver-card',
  imports: [TranslatePipe],
  templateUrl: './approver-card.html',
  styleUrl: './approver-card.css',
})
export class ApproverCard {
  readonly manager = input<Requester | null>(null);
}
