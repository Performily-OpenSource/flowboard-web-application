import {Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {EmployeeSummaryCard} from '../employee-summary-card/employee-summary-card';

/** Data passed to the employee status dialog through MAT_DIALOG_DATA. */
export interface EmployeeStatusData {
  /** The employee whose status is changed. */
  employee: Employee;
}

/** Statuses that can be set from this dialog. */
type ChangeableStatus = 'ACTIVE' | 'SUSPENDED';

/**
 * Dialog to change the employment status of an employee between active and suspended (US14).
 * Shows a summary of the employee and preselects the opposite of the current status.
 * Receives {@link EmployeeStatusData} and closes with true when confirmed.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-employee-status-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslatePipe,
    EmployeeSummaryCard
  ],
  templateUrl: './employee-status-dialog.html',
  styleUrl: './employee-status-dialog.css',
})
export class EmployeeStatusDialog {
  /** Workspace store used to update the employee status. */
  private store = inject(WorkspaceStore);
  /** Reference to this dialog, used to close it with the result. */
  private dialogRef = inject(MatDialogRef<EmployeeStatusDialog>);
  /** Dialog data with the employee. */
  readonly data = inject<EmployeeStatusData>(MAT_DIALOG_DATA);

  /** Statuses available for selection. */
  readonly statuses: ChangeableStatus[] = ['ACTIVE', 'SUSPENDED'];
  /** Selected new status; defaults to the opposite of the current one. */
  readonly status = new FormControl<ChangeableStatus>(
    this.data.employee.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
    { nonNullable: true, validators: [Validators.required] });

  /** Updates the employee status when it changed and closes the dialog with true. */
  confirm() {
    if (this.status.value !== this.data.employee.status) {
      this.store.changeEmployeeStatus(this.data.employee, this.status.value);
    }
    this.dialogRef.close(true);
  }
}
