import {Component, computed, inject, input} from '@angular/core';
import {WorkspaceAcl} from '../../../infrastructure/workspace-acl';

@Component({
  selector: 'app-employee-summary-panel',
  templateUrl: './employee-summary-panel.html',
  styleUrl: './employee-summary-panel.css',
})
/**
 * Shows a card with the employee (avatar, name, position and area) and the key/value rows projected
 * by the dialog.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class EmployeeSummaryPanel {
  private directory = inject(WorkspaceAcl);
  readonly employeeId = input.required<number>();
  readonly employee = computed(() => this.directory.findEmployee(this.employeeId()));
}
