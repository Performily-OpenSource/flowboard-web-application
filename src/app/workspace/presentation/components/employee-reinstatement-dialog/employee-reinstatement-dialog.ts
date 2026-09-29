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

export interface EmployeeReinstatementData {
  employee: Employee;
}

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
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);
  readonly store = inject(WorkspaceStore);
  private dialogRef = inject(MatDialogRef<EmployeeReinstatementDialog>);
  readonly data = inject<EmployeeReinstatementData>(MAT_DIALOG_DATA);

  readonly contractTypes = CONTRACT_TYPES;
  readonly minDate = this.data.employee.terminationDate ?? this.data.employee.hireDate;

  readonly subtitle = this.translate.instant('reinstatement-dialog.terminated-on',
    { date: new LocalDatePipe().transform(this.data.employee.terminationDate) });

  readonly summaryRows = computed<SummaryRow[]>(() => [
    { label: this.translate.instant('reinstatement-dialog.last-area'), value: this.data.employee.area?.name ?? '-' },
    { label: this.translate.instant('reinstatement-dialog.last-position'), value: this.data.employee.position?.title ?? '-' },
    { label: this.translate.instant('reinstatement-dialog.document'), value: `${this.data.employee.identityDocumentType} ${this.data.employee.identityDocumentNumber}` }
  ]);

  readonly form = this.fb.group({
    areaId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    positionId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    reinstatementDate: new FormControl<string>(new Date().toLocaleDateString('en-CA'), { nonNullable: true, validators: [Validators.required] }),
    contractType: new FormControl<ContractType>(this.data.employee.contractType, { nonNullable: true, validators: [Validators.required] })
  });

  private readonly selectedAreaId = toSignal(this.form.controls.areaId.valueChanges, { initialValue: null });
  readonly positionsOfArea = computed(() => this.store.getActivePositionsByArea(this.selectedAreaId()));

  constructor() {
    super();
    this.form.controls.areaId.valueChanges.subscribe(() => this.form.controls.positionId.setValue(null));
  }

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
