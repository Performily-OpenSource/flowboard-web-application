import {Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {WorkspaceStore} from '../../../application/workspace.store';
import {CONTRACT_TYPES, ContractType, Employee} from '../../../domain/model/employee.entity';
import {EmployeeSummaryCard, SummaryRow} from '../employee-summary-card/employee-summary-card';

/** Data passed to the employee reinstatement dialog through MAT_DIALOG_DATA. */
export interface EmployeeReinstatementData {
  /** The terminated employee to reinstate. */
  employee: Employee;
}

/**
 * Dialog to reinstate a terminated employee (US16).
 * Shows the termination date and the last area, position and identity document of the employee,
 * and asks for the new area, position, reinstatement date and contract type.
 * Receives {@link EmployeeReinstatementData} and closes with true when the employee is reinstated.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-employee-reinstatement-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslatePipe,
    EmployeeSummaryCard
  ],
  templateUrl: './employee-reinstatement-dialog.html',
  styleUrl: './employee-reinstatement-dialog.css',
})
export class EmployeeReinstatementDialog extends BaseForm {
  /** Form builder used to create the reinstatement form. */
  private fb = inject(FormBuilder);
  /** Translation service used to build the subtitle and summary labels. */
  private translate = inject(TranslateService);
  /** Workspace store that holds areas and positions; also used by the template to list areas. */
  readonly store = inject(WorkspaceStore);
  /** Reference to this dialog, used to close it with the result. */
  private dialogRef = inject(MatDialogRef<EmployeeReinstatementDialog>);
  /** Dialog data with the employee to reinstate. */
  readonly data = inject<EmployeeReinstatementData>(MAT_DIALOG_DATA);

  /** Contract types available for selection. */
  readonly contractTypes = CONTRACT_TYPES;
  /** Earliest reinstatement date allowed: the termination date, or the hire date if there is none. */
  readonly minDate = this.data.employee.terminationDate ?? this.data.employee.hireDate;

  /** Subtitle of the summary card with the termination date. */
  readonly subtitle = this.translate.instant('reinstatement-dialog.terminated-on',
    { date: new LocalDatePipe().transform(this.data.employee.terminationDate) });

  /** Rows shown in the employee summary card with the last area, position and identity document. */
  readonly summaryRows = computed<SummaryRow[]>(() => [
    { label: this.translate.instant('reinstatement-dialog.last-area'), value: this.data.employee.area?.name ?? '-' },
    { label: this.translate.instant('reinstatement-dialog.last-position'), value: this.data.employee.position?.title ?? '-' },
    { label: this.translate.instant('reinstatement-dialog.document'), value: `${this.data.employee.identityDocumentType} ${this.data.employee.identityDocumentNumber}` }
  ]);

  /** Form with the area, position, reinstatement date and contract type. */
  readonly form = this.fb.group({
    areaId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    positionId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    reinstatementDate: new FormControl<string>(new Date().toLocaleDateString('en-CA'), { nonNullable: true, validators: [Validators.required] }),
    contractType: new FormControl<ContractType>(this.data.employee.contractType, { nonNullable: true, validators: [Validators.required] })
  });

  /** Area currently selected in the form, as a signal. */
  private readonly selectedAreaId = toSignal(this.form.controls.areaId.valueChanges, { initialValue: null });
  /** Active positions of the selected area. */
  readonly positionsOfArea = computed(() => this.store.getActivePositionsByArea(this.selectedAreaId()));

  /** Creates the dialog and clears the selected position whenever the area changes. */
  constructor() {
    super();
    this.form.controls.areaId.valueChanges.subscribe(() => this.form.controls.positionId.setValue(null));
  }

  /** Validates the form, reinstates the employee through the store and closes the dialog with true. */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.store.reinstateEmployee(this.data.employee, {
      areaId: value.areaId!,
      positionId: value.positionId!,
      reinstatementDate: value.reinstatementDate,
      contractType: value.contractType
    });
    this.dialogRef.close(true);
  }
}
