import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {JobAssignment} from '../../../domain/model/job-assignment.entity';

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
  readonly assignments = input.required<JobAssignment[]>();
}
