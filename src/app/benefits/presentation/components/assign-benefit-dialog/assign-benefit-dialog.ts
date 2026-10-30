import {Component, computed, DestroyRef, effect, inject, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {map} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {DateRange} from '../../../../shared/domain/model/date-range';
import {BenefitsStore} from '../../../application/benefits.store';
import {WorkspaceAcl} from '../../../infrastructure/workspace-acl';
import {localToday} from '../../../application/local-today';
import {BenefitUnit} from '../../../domain/model/benefit-type.entity';
import {guardUnsavedChanges} from '../benefits-confirm-dialog/guard-unsaved-changes';
import {PluralKeyPipe} from '../../pipes/plural-key-pipe';

/** Step of the quantity input for each unit: cents for money, half days, whole units. */
const QUANTITY_STEP: Record<BenefitUnit, number> = { MONEY: 0.01, DAYS: 0.5, UNITS: 1 };

/**
 * Data received by the assign benefit dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface AssignBenefitData {
  benefitTypeId?: number;
}

type AssignmentTarget = 'EMPLOYEE' | 'AREA';

@Component({
  selector: 'app-assign-benefit-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe, LocalDatePipe,
    PluralKeyPipe],
  templateUrl: './assign-benefit-dialog.html',
  styleUrl: './assign-benefit-dialog.css',
})
/**
 * Manages the assignment of a benefit to one employee or to every active employee of an area
 * (WA-29).
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class AssignBenefitDialog extends BaseForm {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AssignBenefitDialog>);
  readonly store = inject(BenefitsStore);
  readonly directory = inject(WorkspaceAcl);
  readonly data = inject<AssignBenefitData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    benefitTypeId: new FormControl<number | null>(this.data.benefitTypeId ?? null, { validators: [Validators.required] }),
    target: new FormControl<AssignmentTarget>('EMPLOYEE', { nonNullable: true }),
    employeeId: new FormControl<number | null>(null),
    areaId: new FormControl<number | null>(null),
    validFrom: new FormControl<string>(localToday(), { nonNullable: true, validators: [Validators.required] }),
    validTo: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    quantity: new FormControl<number | null>(null,
      { validators: [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)] })
  });

  private readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() });

  readonly selectedType = computed(() =>
    this.store.benefitTypes().find(type => type.id === this.value().benefitTypeId) ?? null);

  /** Active employees sorted by name, for the employee selector. */
  readonly sortedEmployees = computed(() =>
    [...this.directory.activeEmployees()].sort((a, b) => a.fullName.localeCompare(b.fullName, 'es')));

  /** Step of the quantity input for the unit of the selected benefit. */
  readonly quantityStep = computed(() => QUANTITY_STEP[this.selectedType()?.unit ?? 'MONEY']);

  /** Whether the quantity does not fit the unit: units must be whole, days go in halves. */
  readonly quantityNotInStep = computed(() => {
    const quantity = Number(this.value().quantity);
    const unit = this.selectedType()?.unit;
    if (!quantity || !unit || unit === 'MONEY') return false;
    return !Number.isInteger(quantity / QUANTITY_STEP[unit]);
  });

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

  /** Names of the employees of the area that will be skipped because they already have the benefit. */
  readonly skippedNames = computed(() => (this.plan()?.conflictingEmployeeIds ?? [])
    .map(employeeId => this.directory.findEmployee(employeeId)?.fullName ?? '')
    .filter(name => name !== '')
    .join(', '));

  readonly areaHasNoActiveEmployees = computed(() =>
    this.value().target === 'AREA' && this.value().areaId !== null && this.targetIds().length === 0);

  /**
   * Data of the area preview to ask the web service, or null when the form is not complete. It only
   * changes with the benefit, the area or the period, so typing the quantity does not call again.
   */
  private readonly areaPreviewRequest = computed(() => {
    const value = this.value();
    const validity = this.validity();
    if (value.target !== 'AREA' || value.areaId === null || value.benefitTypeId === null || !validity) return null;
    return { benefitTypeId: value.benefitTypeId, areaId: value.areaId, startDate: validity.startDate, endDate: validity.endDate };
  }, {
    equal: (a, b) => a?.benefitTypeId === b?.benefitTypeId && a?.areaId === b?.areaId &&
      a?.startDate === b?.startDate && a?.endDate === b?.endDate
  });

  /** Preview of the web service for the area of the form, or null while it is not answered. */
  private readonly areaPreview = computed(() => {
    const preview = this.store.areaPreview();
    const value = this.value();
    const validity = this.validity();
    return preview && validity && value.target === 'AREA' && preview.areaId === value.areaId &&
      preview.benefitTypeId === value.benefitTypeId && preview.startDate === validity.startDate &&
      preview.endDate === validity.endDate ? preview : null;
  });

  /** Employees of the area that will receive the benefit: from the web service, or the local plan. */
  readonly areaToAssign = computed(() => this.areaPreview()?.toAssign ?? this.plan()?.employeeIds.length ?? 0);

  /** Employees of the area skipped because they already have the benefit in the period. */
  readonly areaSkipped = computed(() =>
    this.areaPreview()?.alreadyAssigned ?? this.plan()?.conflictingEmployeeIds.length ?? 0);

  /** Protects the unsaved changes of the form and asks the web service for the area preview. */
  constructor() {
    super();
    guardUnsavedChanges(this.dialogRef, this.form, inject(MatDialog));
    effect(() => {
      const request = this.areaPreviewRequest();
      if (!request) return;
      untracked(() => this.store.previewAreaAssignment(request.benefitTypeId, request.areaId,
        new DateRange(request.startDate, request.endDate)));
    });
    inject(DestroyRef).onDestroy(() => this.store.clearAreaPreview());
  }

  readonly blocked = computed(() => {
    const plan = this.plan();
    const nobodyToAssign = this.value().target === 'AREA' ? this.areaToAssign() === 0 : plan?.employeeIds.length === 0;
    return this.invalidRange() || this.areaHasNoActiveEmployees() || (!!plan && nobodyToAssign);
  });

  /**
   * Gets the name of an area to show it in the summary.
   * @param areaId Identifier of the area (AreaId of the Shared Kernel).
   * @author Salym
   */
  areaName(areaId: number | null): string {
    return this.directory.areas().find(area => area.id === areaId)?.name ?? '';
  }

  /**
   * Changes the recipients of the benefit between one employee and a whole area.
   * @param target Recipients of the benefit: one employee or a whole area.
   * @author Salym
   */
  setTarget(target: AssignmentTarget) {
    this.form.controls.target.setValue(target);
  }

  /**
   * Validates the form and the overlapping rule and assigns the benefit.
   * @author Salym
   */
  confirm() {
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const targetMissing = value.target === 'EMPLOYEE' ? value.employeeId === null : value.areaId === null;
    if (targetMissing) {
      const control = value.target === 'EMPLOYEE' ? this.form.controls.employeeId : this.form.controls.areaId;
      control.setErrors({ required: true });
    }
    if (this.form.invalid || targetMissing || this.blocked() || this.quantityNotInStep() ||
      value.benefitTypeId === null || value.quantity === null) return;

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
