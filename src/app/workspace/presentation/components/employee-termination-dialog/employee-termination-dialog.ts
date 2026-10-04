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

/** Data passed to the employee termination dialog through MAT_DIALOG_DATA. */
export interface EmployeeTerminationData {
  /** The employee to terminate. */
  employee: Employee;
}

/**
 * Dialog to register the termination of an employee (US15).
 * When the employee still has active subordinates the termination is blocked and the dialog lists them
 * with a link to reassign them in the organization chart; otherwise it asks for the termination date and reason.
 * Receives {@link EmployeeTerminationData} and closes with true when the employee is terminated.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
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
  /** Form builder used to create the termination form. */
  private fb = inject(FormBuilder);
  /** Router used to navigate to the organization chart. */
  private router = inject(Router);
  /** Translation service used to build the summary labels. */
  private translate = inject(TranslateService);
  /** Workspace store used to read subordinates and terminate the employee. */
  private store = inject(WorkspaceStore);
  /** Reference to this dialog, used to close it with the result. */
  private dialogRef = inject(MatDialogRef<EmployeeTerminationDialog>);
  /** Dialog data with the employee to terminate. */
  readonly data = inject<EmployeeTerminationData>(MAT_DIALOG_DATA);

  /** Active subordinates of the employee; termination is blocked while there are any. */
  readonly subordinates = this.store.getSubordinates(this.data.employee.id);
  /** First three subordinates shown in the blocked state. */
  readonly visibleSubordinates = computed(() => this.subordinates().slice(0, 3));

  /** Rows shown in the employee summary card with the hire date and direct reports. */
  readonly summaryRows = computed<SummaryRow[]>(() => [
    { label: this.translate.instant('termination-dialog.hire-date'), value: new LocalDatePipe().transform(this.data.employee.hireDate) },
    { label: this.translate.instant('termination-dialog.reports'), value: this.translate.instant('termination-dialog.none') }
  ]);

  /** Form with the termination date and reason. */
  readonly form = this.fb.group({
    terminationDate: new FormControl<string>(new Date().toLocaleDateString('en-CA'), { nonNullable: true, validators: [Validators.required] }),
    terminationReason: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] })
  });

  /**
   * Gets the initials of an employee for the avatar.
   *
   * @param employee - The employee to get the initials from.
   * @returns The uppercase initials of the first name and last name
   * @author Oscar Lizandro Vasquez Llave
   */
  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Checks if the termination date is earlier than the hire date.
   *
   * @returns True if the termination date is before the hire date, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  get dateBeforeHire(): boolean {
    const date = this.form.controls.terminationDate.value;
    return !!date && date < this.data.employee.hireDate;
  }

  /**
   * Validates the form, terminates the employee through the store and closes the dialog with true.
   * Does nothing when the form is invalid or the date is before the hire date.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.dateBeforeHire) return;
    const { terminationReason, terminationDate } = this.form.getRawValue();
    this.store.terminateEmployee(this.data.employee, terminationReason.trim(), terminationDate);
    this.dialogRef.close(true);
  }

  /**
   * Closes the dialog with false and opens the organization chart highlighting the employee
   * so that their subordinates can be reassigned.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  goToReassign() {
    this.dialogRef.close(false);
    this.router.navigate(['/workspace/organization-chart'], { queryParams: { highlight: this.data.employee.id } }).then();
  }
}
