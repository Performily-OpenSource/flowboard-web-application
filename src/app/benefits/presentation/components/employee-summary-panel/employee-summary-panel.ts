import {Component, computed, inject, input} from '@angular/core';
import {WorkspaceAcl} from '../../../infrastructure/workspace-acl';

/** Grey card with the employee (avatar, name, position · area) and projected key/value rows. */
@Component({
  selector: 'app-employee-summary-panel',
  templateUrl: './employee-summary-panel.html',
  styleUrl: './employee-summary-panel.css',
})
export class EmployeeSummaryPanel {
  private directory = inject(WorkspaceAcl);
  readonly employeeId = input.required<number>();
  readonly employee = computed(() => this.directory.findEmployee(this.employeeId()));
}
