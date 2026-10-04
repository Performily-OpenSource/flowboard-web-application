import {Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {EmployeeSummaryCard, SummaryRow} from '../employee-summary-card/employee-summary-card';

/** Data passed to the direct manager dialog through MAT_DIALOG_DATA. */
export interface DirectManagerData {
  /** The employee whose direct manager is assigned. */
  employee: Employee;
}

/**
 * Dialog to assign, change or remove the direct manager of an employee (US11).
 * Shows a summary of the employee with the current manager, an autocomplete of active candidates
 * excluding the employee itself, and the cycle path as chips when the selected manager would create
 * a reporting cycle. Receives {@link DirectManagerData} and closes with true when a change is saved.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-direct-manager-dialog',
  imports: [
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    TranslatePipe,
    EmployeeSummaryCard
  ],
  templateUrl: './direct-manager-dialog.html',
  styleUrl: './direct-manager-dialog.css',
})
export class DirectManagerDialog {
  /** Workspace store that holds employees and the reporting lines. */
  private store = inject(WorkspaceStore);
  /** Translation service used to build the summary labels. */
  private translate = inject(TranslateService);
  /** Reference to this dialog, used to close it with the result. */
  private dialogRef = inject(MatDialogRef<DirectManagerDialog>);
  /** Dialog data with the employee being edited. */
  readonly data = inject<DirectManagerData>(MAT_DIALOG_DATA);

  /** Current direct manager of the employee, if any. */
  private readonly currentManager = this.data.employee.directManagerId
    ? this.store.getEmployeeById(this.data.employee.directManagerId)()
    : undefined;

  /** Rows shown in the employee summary card with the current manager. */
  readonly summaryRows: SummaryRow[] = [{
    label: this.translate.instant('manager-dialog.current-manager'),
    value: this.currentManager?.fullName ?? this.translate.instant('employee.no-manager')
  }];

  /** Text typed in the manager search input. */
  readonly searchText = signal('');
  /** Manager selected from the autocomplete, or null if none. */
  readonly selectedManager = signal<Employee | null>(null);

  /** Active employees matching the search text, excluding the employee itself (up to 20). */
  readonly candidates = computed(() => {
    const text = this.searchText().trim().toLowerCase();
    return this.store.activeEmployees()
      .filter(employee => employee.id !== this.data.employee.id)
      .filter(employee => !text || employee.fullName.toLowerCase().includes(text))
      .slice(0, 20);
  });

  /** Reporting chain that would form a cycle with the selected manager; empty when there is no cycle. */
  readonly cyclePath = computed(() => {
    const manager = this.selectedManager();
    return manager ? this.store.getCyclePath(this.data.employee.id, manager.id) : [];
  });

  /**
   * Gets the text to display for an autocomplete value.
   *
   * @param employee - The selected employee, the typed text or null.
   * @returns The full name of the employee, the text itself, or an empty string
   * @author Oscar Lizandro Vasquez Llave
   */
  displayName = (employee: Employee | string | null): string =>
    typeof employee === 'string' ? employee : employee?.fullName ?? '';

  /**
   * Builds a short name with the first given name and the first last name.
   *
   * @param employee - The employee to format.
   * @returns The short name of the employee
   * @author Oscar Lizandro Vasquez Llave
   */
  shortName(employee: Employee): string {
    return `${employee.firstName.split(' ')[0]} ${employee.lastName.split(' ')[0]}`;
  }

  /**
   * Updates the search text and clears the current selection when the user types.
   *
   * @param event - The input event of the search field.
   * @author Oscar Lizandro Vasquez Llave
   */
  onInput(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.selectedManager.set(null);
  }

  /**
   * Stores the manager chosen in the autocomplete.
   *
   * @param event - The autocomplete selection event.
   * @author Oscar Lizandro Vasquez Llave
   */
  onSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedManager.set(event.option.value as Employee);
  }

  /** Removes the direct manager of the employee and closes the dialog with true. */
  removeManager() {
    this.store.assignDirectManager(this.data.employee, null);
    this.dialogRef.close(true);
  }

  /**
   * Assigns the selected manager to the employee and closes the dialog with true.
   * Does nothing when no manager is selected or the selection would create a cycle.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  confirm() {
    const manager = this.selectedManager();
    if (!manager || this.cyclePath().length > 0) return;
    this.store.assignDirectManager(this.data.employee, manager.id);
    this.dialogRef.close(true);
  }
}
