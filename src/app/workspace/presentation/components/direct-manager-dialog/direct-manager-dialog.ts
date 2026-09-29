import {Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {EmployeeSummaryCard, SummaryRow} from '../employee-summary-card/employee-summary-card';

export interface DirectManagerData {
  employee: Employee;
}

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
  private store = inject(WorkspaceStore);
  private translate = inject(TranslateService);
  private dialogRef = inject(MatDialogRef<DirectManagerDialog>);
  readonly data = inject<DirectManagerData>(MAT_DIALOG_DATA);

  private readonly currentManager = this.data.employee.directManagerId
    ? this.store.getEmployeeById(this.data.employee.directManagerId)()
    : undefined;

  readonly summaryRows: SummaryRow[] = [{
    label: this.translate.instant('manager-dialog.current-manager'),
    value: this.currentManager?.fullName ?? this.translate.instant('employee.no-manager')
  }];

  readonly searchText = signal('');
  readonly selectedManager = signal<Employee | null>(null);

  readonly candidates = computed(() => {
    const text = this.searchText().trim().toLowerCase();
    return this.store.activeEmployees()
      .filter(employee => employee.id !== this.data.employee.id)
      .filter(employee => !text || employee.fullName.toLowerCase().includes(text))
      .slice(0, 20);
  });

  readonly cyclePath = computed(() => {
    const manager = this.selectedManager();
    return manager ? this.store.getCyclePath(this.data.employee.id, manager.id) : [];
  });

  displayName = (employee: Employee | string | null): string =>
    typeof employee === 'string' ? employee : employee?.fullName ?? '';

  shortName(employee: Employee): string {
    return `${employee.firstName.split(' ')[0]} ${employee.lastName.split(' ')[0]}`;
  }

  onInput(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.selectedManager.set(null);
  }

  onSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedManager.set(event.option.value as Employee);
  }

  removeManager() {
    this.store.assignDirectManager(this.data.employee, null);
    this.dialogRef.close(true);
  }

  confirm() {
    const manager = this.selectedManager();
    if (!manager || this.cyclePath().length > 0) return;
    this.store.assignDirectManager(this.data.employee, manager.id);
    this.dialogRef.close(true);
  }
}
