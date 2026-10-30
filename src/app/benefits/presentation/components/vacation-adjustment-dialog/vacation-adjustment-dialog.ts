import {Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {map} from 'rxjs';
import {DecimalPipe} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {BenefitsStore} from '../../../application/benefits.store';
import {VacationBalance} from '../../../domain/model/vacation-balance.entity';
import {EmployeeSummaryPanel} from '../employee-summary-panel/employee-summary-panel';
import {notBlank} from '../../validators/benefits-validators';
import {guardUnsavedChanges} from '../benefits-confirm-dialog/guard-unsaved-changes';
import {PluralKeyPipe} from '../../pipes/plural-key-pipe';

/** Largest number of days that can be added or removed in one adjustment. */
export const MAX_ADJUSTMENT_DAYS = 60;

/**
 * Data received by the vacation adjustment dialog.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface VacationAdjustmentData {
  balance: VacationBalance;
}

type AdjustmentOperation = 'ADD' | 'SUBTRACT';

@Component({
  selector: 'app-vacation-adjustment-dialog',
  imports: [ReactiveFormsModule, DecimalPipe, MatDialogTitle, MatDialogClose, MatButton, MatIcon, TranslatePipe,
    EmployeeSummaryPanel, PluralKeyPipe],
  templateUrl: './vacation-adjustment-dialog.html',
  styleUrl: './vacation-adjustment-dialog.css',
})
/**
 * Manages the manual adjustment of a vacation balance with a mandatory reason (WA-31).
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class VacationAdjustmentDialog extends BaseForm {
  private fb = inject(FormBuilder);
  private store = inject(BenefitsStore);
  private dialogRef = inject(MatDialogRef<VacationAdjustmentDialog>);
  readonly balance = inject<VacationAdjustmentData>(MAT_DIALOG_DATA).balance;

  readonly operations: AdjustmentOperation[] = ['ADD', 'SUBTRACT'];
  readonly maxDays = MAX_ADJUSTMENT_DAYS;

  readonly form = this.fb.group({
    operation: new FormControl<AdjustmentOperation>('ADD', { nonNullable: true }),
    days: new FormControl<number | null>(null,
      { validators: [Validators.required, Validators.min(0.01), Validators.max(MAX_ADJUSTMENT_DAYS),
          Validators.pattern(/^\d+(\.\d{1,2})?$/)] }),
    reason: new FormControl<string>('', { nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(250)] })
  });

  /** Protects the unsaved changes of the form. */
  constructor() {
    super();
    guardUnsavedChanges(this.dialogRef, this.form, inject(MatDialog));
  }

  private readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() });

  /** Signed days of the adjustment: positive adds, negative removes. */
  private readonly signedDays = computed(() => {
    const days = Number(this.value().days) || 0;
    return this.value().operation === 'ADD' ? days : -days;
  });

  readonly resultingDays = computed(() => this.balance.availableAfterAdjustment(this.signedDays()));
  readonly wouldBeNegative = computed(() => this.resultingDays() < 0);

  /**
   * Validates the form and saves the adjustment when the balance does not become negative.
   * @author Salym
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.wouldBeNegative()) return;
    this.store.adjustVacationBalance(this.balance, this.signedDays(), this.form.controls.reason.value.trim());
    this.dialogRef.close(true);
  }
}
