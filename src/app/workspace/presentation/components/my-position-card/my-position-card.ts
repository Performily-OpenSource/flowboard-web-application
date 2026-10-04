import {Component, computed, inject, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {WorkspaceStore} from '../../../application/workspace.store';

/**
 * "My position" card of the collaborator home (US19), registered in DASHBOARD_WIDGETS
 * for the 'employee' dashboard in the 'column-2' slot. Shows the area, position, contract,
 * hire date and direct manager of the employee, with a link to "My profile".
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-my-position-card',
  imports: [RouterLink, TranslatePipe, LocalDatePipe],
  templateUrl: './my-position-card.html',
  styleUrl: './my-position-card.css',
})
export class MyPositionCard {
  private readonly store = inject(WorkspaceStore);

  /** Identifier of the employee whose position is shown. */
  readonly employeeId = input.required<number>();

  /** Employee shown in the card. */
  readonly employee = computed(() => this.store.getEmployeeById(this.employeeId())());

  /** Direct manager of the employee, or undefined when none is assigned (US19, scenario 2). */
  readonly directManager = computed(() => {
    const managerId = this.employee()?.directManagerId;
    return managerId ? this.store.getEmployeeById(managerId)() : undefined;
  });
}
