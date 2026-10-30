import {Component, inject} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {BenefitsStore} from '../../../application/benefits.store';
import {
  BENEFIT_PERIODICITIES,
  BENEFIT_UNITS,
  BenefitPeriodicity,
  BenefitType,
  BenefitUnit
} from '../../../domain/model/benefit-type.entity';
import {notBlank} from '../../validators/benefits-validators';
import {guardUnsavedChanges} from '../benefits-confirm-dialog/guard-unsaved-changes';
import {PluralKeyPipe} from '../../pipes/plural-key-pipe';

/**
 * Data received by the benefit form dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitTypeFormData {
  benefitType?: BenefitType;
}

@Component({
  selector: 'app-benefit-type-form-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogClose, MatButton, MatIcon, MatSlideToggle, TranslatePipe,
    PluralKeyPipe],
  templateUrl: './benefit-type-form-dialog.html',
  styleUrl: './benefit-type-form-dialog.css',
})
/**
 * Manages the creation and editing of benefits of the catalog (WA-28).
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitTypeFormDialog extends BaseForm {
  private fb = inject(FormBuilder);
  private store = inject(BenefitsStore);
  private dialogRef = inject(MatDialogRef<BenefitTypeFormDialog>);
  readonly data = inject<BenefitTypeFormData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.benefitType;
  readonly units = BENEFIT_UNITS;
  readonly periodicities = BENEFIT_PERIODICITIES;

  /**
   * Current or upcoming assignments of the benefit being edited. While there are any, the unit and
   * the balance setting cannot change because they define what was already assigned.
   */
  readonly liveAssignments = this.data.benefitType ? this.store.reachOf(this.data.benefitType.id) : 0;

  /** Rejects a name already used in the catalog, ignoring case and accents. */
  private readonly uniqueName = (control: AbstractControl<string>): ValidationErrors | null =>
    control.value && this.store.isBenefitNameTaken(control.value.trim(), this.data.benefitType?.id ?? null)
      ? { taken: true } : null;

  readonly form = this.fb.group({
    name: new FormControl<string>(this.data.benefitType?.name ?? '',
      { nonNullable: true, validators: [Validators.required, notBlank, Validators.maxLength(80), this.uniqueName] }),
    description: new FormControl<string>(this.data.benefitType?.description ?? '',
      { nonNullable: true, validators: [Validators.maxLength(255)] }),
    unit: new FormControl<BenefitUnit>(this.data.benefitType?.unit ?? 'MONEY', { nonNullable: true }),
    periodicity: new FormControl<BenefitPeriodicity>(this.data.benefitType?.periodicity ?? 'MONTHLY', { nonNullable: true }),
    hasBalance: new FormControl<boolean>(this.data.benefitType?.hasBalance ?? false, { nonNullable: true })
  });

  /** Locks the fields that cannot change and protects the unsaved changes. */
  constructor() {
    super();
    if (this.liveAssignments > 0) {
      this.form.controls.unit.disable();
      this.form.controls.hasBalance.disable();
    }
    guardUnsavedChanges(this.dialogRef, this.form, inject(MatDialog));
  }

  /**
   * Validates the form, checks that the name is unique and saves the benefit.
   * @author Salym
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const name = value.name.trim();

    if (this.store.isBenefitNameTaken(name, this.data.benefitType?.id ?? null)) {
      this.form.controls.name.setErrors({ taken: true });
      return;
    }

    const benefitType = new BenefitType({
      id: this.data.benefitType?.id ?? 0,
      name,
      description: value.description.trim(),
      hasBalance: value.hasBalance,
      unit: value.unit,
      periodicity: value.periodicity,
      active: this.data.benefitType?.active ?? true
    });
    if (this.isEdit) {
      this.store.updateBenefitType(benefitType);
    } else {
      this.store.addBenefitType(benefitType);
    }
    this.dialogRef.close(true);
  }
}
