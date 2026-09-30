import {Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {map} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {DateRange} from '../../../../shared/domain/model/date-range';
import {BenefitsStore} from '../../../application/benefits.store';
import {EmployeeDirectory} from '../../../application/employee-directory';

export interface AssignBenefitData {
  benefitTypeId?: number;
}

type AssignmentTarget = 'EMPLOYEE' | 'AREA';

/** WA-29 Asignar beneficio: to one employee or to every active employee of an area. */
@Component({
  selector: 'app-assign-benefit-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, LocalDatePipe],
  templateUrl: './assign-benefit-dialog.html',
  styleUrl: './assign-benefit-dialog.css',
})
export class AssignBenefitDialog extends BaseForm {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AssignBenefitDialog>);
  readonly store = inject(BenefitsStore);
  readonly directory = inject(EmployeeDirectory);
  readonly data = inject<AssignBenefitData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    benefitTypeId: new FormControl<number | null>(this.data.benefitTypeId ?? null, { validators: [Validators.required] }),
    target: new FormControl<AssignmentTarget>('EMPLOYEE', { nonNullable: true }),
    employeeId: new FormControl<number | null>(null),
    areaId: new FormControl<number | null>(null),
    validFrom: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    validTo: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    quantity: new FormControl<number | null>(null,
      { validators: [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)] })
  });

  private readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() });

  readonly selectedType = computed(() =>
    this.store.benefitTypes().find(type => type.id === this.value().benefitTypeId) ?? null);

  readonly invalidRange = computed(() => {
    const { validFrom, validTo } = this.value();
    return !!validFrom && !!validTo && !DateRange.isValid(validFrom, validTo);
  });

  private readonly validity = computed(() => {
    const { validFrom, validTo } = this.value();
    return DateRange.isValid(validFrom, validTo) ? new DateRange(validFrom, validTo) : null;
  });

  private readonly targetIds = computed<number[]>(() => {
    const value = this.value();
    if (value.target === 'AREA') {
      return value.areaId !== null ? this.directory.activeEmployeeIdsOfArea(value.areaId) : [];
    }
    return value.employeeId !== null ? [value.employeeId] : [];
  });

  /** Who receives the benefit and who is skipped because of an overlapping assignment. */
  readonly plan = computed(() => {
    const type = this.selectedType();
    const validity = this.validity();
    if (!type || !validity || this.targetIds().length === 0) return null;
    return this.store.planAssignment(type.id, this.targetIds(), validity);
  });

  /** Overlapping assignment of the selected employee, used for the WA-29 error message. */
  readonly conflict = computed(() => {
    const type = this.selectedType();
    const validity = this.validity();
    const value = this.value();
    if (value.target !== 'EMPLOYEE' || !type || !validity || value.employeeId === null) return null;
    const assignment = this.store.findConflict(type.id, value.employeeId, validity);
    return assignment ? {
      employee: this.directory.findEmployee(value.employeeId)?.fullName ?? '',
      from: assignment.validity.startDate,
      to: assignment.validity.endDate
    } : null;
  });

  readonly areaHasNoActiveEmployees = computed(() =>
    this.value().target === 'AREA' && this.value().areaId !== null && this.targetIds().length === 0);

  readonly blocked = computed(() => {
    const plan = this.plan();
    return this.invalidRange() || this.areaHasNoActiveEmployees() || (!!plan && plan.employeeIds.length === 0);
  });

  areaName(areaId: number | null): string {
    return this.directory.areas().find(area => area.id === areaId)?.name ?? '';
  }

  setTarget(target: AssignmentTarget) {
    this.form.controls.target.setValue(target);
  }

  confirm() {
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const targetMissing = value.target === 'EMPLOYEE' ? value.employeeId === null : value.areaId === null;
    if (targetMissing) {
      const control = value.target === 'EMPLOYEE' ? this.form.controls.employeeId : this.form.controls.areaId;
      control.setErrors({ required: true });
    }
    if (this.form.invalid || targetMissing || this.blocked() || value.benefitTypeId === null || value.quantity === null) return;

    this.store.assignBenefit({
      benefitTypeId: value.benefitTypeId,
      employeeId: value.target === 'EMPLOYEE' ? value.employeeId : null,
      areaId: value.target === 'AREA' ? value.areaId : null,
      validity: new DateRange(value.validFrom, value.validTo),
      quantity: Number(value.quantity)
    });
    this.dialogRef.close(true);
  }
}
