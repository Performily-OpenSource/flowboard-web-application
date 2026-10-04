import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {JobAssignment} from '../../../domain/model/job-assignment.entity';

/**
 * Timeline with the job assignment history of an employee (US10).
 * Shows each position, area, change type and period, highlighting the current assignment.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-job-assignment-history',
  imports: [
    TranslatePipe,
    LocalDatePipe
  ],
  templateUrl: './job-assignment-history.html',
  styleUrl: './job-assignment-history.css',
})
export class JobAssignmentHistory {
  /** Job assignments to display. */
  readonly assignments = input.required<JobAssignment[]>();
}
