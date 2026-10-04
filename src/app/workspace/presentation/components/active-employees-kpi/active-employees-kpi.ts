import {Component, computed, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';

/**
 * "Active employees" indicator of the HR dashboard (WA-02), registered in the 'kpi' slot.
 * Shows the active employees and how many joined this month.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-active-employees-kpi',
  imports: [TranslatePipe],
  templateUrl: './active-employees-kpi.html',
  styleUrl: './active-employees-kpi.css',
})
export class ActiveEmployeesKpi {
  private readonly store = inject(WorkspaceStore);

  /** Number of active employees. */
  readonly activeCount = computed(() => this.store.activeEmployees().length);

  /** Active employees hired in the current month. */
  readonly hiredThisMonth = computed(() => {
    const month = new Date().toISOString().substring(0, 7);
    return this.store.activeEmployees().filter(employee => employee.hireDate.startsWith(month)).length;
  });
}
