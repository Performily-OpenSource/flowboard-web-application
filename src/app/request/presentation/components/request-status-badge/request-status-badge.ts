import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStatus} from '../../../domain/model/request.entity';

@Component({
  selector: 'app-request-status-badge',
  imports: [TranslatePipe],
  templateUrl: './request-status-badge.html',
  styleUrl: './request-status-badge.css',
})
export class RequestStatusBadge {
  readonly status = input.required<RequestStatus>();
}
