import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStatus} from '../../../domain/model/request.entity';

/**
 * Colored badge with the translated status of a request.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Component({
  selector: 'app-request-status-badge',
  imports: [TranslatePipe],
  templateUrl: './request-status-badge.html',
  styleUrl: './request-status-badge.css',
})
export class RequestStatusBadge {
  /** The status to show. */
  readonly status = input.required<RequestStatus>();
}
