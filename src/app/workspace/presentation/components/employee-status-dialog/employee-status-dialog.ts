import {Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {EmployeeSummaryCard} from '../employee-summary-card/employee-summary-card';

export interface EmployeeStatusData {
  employee: Employee;
}

type ChangeableStatus = 'ACTIVE' | 'SUSPENDED';

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
  private store = inject(WorkspaceStore);
  private dialogRef = inject(MatDialogRef<EmployeeStatusDialog>);
  readonly data = inject<EmployeeStatusData>(MAT_DIALOG_DATA);

  readonly statuses: ChangeableStatus[] = ['ACTIVE', 'SUSPENDED'];
  readonly status = new FormControl<ChangeableStatus>(
    this.data.employee.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
    { nonNullable: true, validators: [Validators.required] });

  confirm() {
    if (this.status.value !== this.data.employee.status) {
      this.store.changeEmployeeStatus(this.data.employee, this.status.value);
    }
    this.dialogRef.close(true);
  }
}
