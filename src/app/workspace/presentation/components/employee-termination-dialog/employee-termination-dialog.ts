import {Component, computed, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {EmployeeSummaryCard, SummaryRow} from '../employee-summary-card/employee-summary-card';

export interface EmployeeTerminationData {
  employee: Employee;
}

@Component({
  selector: 'app-employee-termination-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslatePipe,
    EmployeeSummaryCard
  ],
  templateUrl: './employee-termination-dialog.html',
  styleUrl: './employee-termination-dialog.css',
})
export class EmployeeTerminationDialog extends BaseForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private store = inject(WorkspaceStore);
  private dialogRef = inject(MatDialogRef<EmployeeTerminationDialog>);
  readonly data = inject<EmployeeTerminationData>(MAT_DIALOG_DATA);

  readonly subordinates = this.store.getSubordinates(this.data.employee.id);
  readonly visibleSubordinates = computed(() => this.subordinates().slice(0, 3));

  readonly summaryRows = computed<SummaryRow[]>(() => [
    { label: this.translate.instant('termination-dialog.hire-date'), value: new LocalDatePipe().transform(this.data.employee.hireDate) },
    { label: this.translate.instant('termination-dialog.reports'), value: this.translate.instant('termination-dialog.none') }
  ]);

  readonly form = this.fb.group({
    terminationDate: new FormControl<string>(new Date().toLocaleDateString('en-CA'), { nonNullable: true, validators: [Validators.required] }),
    terminationReason: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] })
  });

  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  get dateBeforeHire(): boolean {
    const date = this.form.controls.terminationDate.value;
    return !!date && date < this.data.employee.hireDate;
  }

  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.dateBeforeHire) return;
    const { terminationReason, terminationDate } = this.form.getRawValue();
    this.store.terminateEmployee(this.data.employee, terminationReason.trim(), terminationDate);
    this.dialogRef.close(true);
  }

  goToReassign() {
    this.dialogRef.close(false);
    this.router.navigate(['/workspace/organization-chart'], { queryParams: { highlight: this.data.employee.id } }).then();
  }
}
