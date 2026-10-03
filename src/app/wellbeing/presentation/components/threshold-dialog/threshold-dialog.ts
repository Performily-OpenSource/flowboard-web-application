import {Component, inject} from '@angular/core';
import {FormArray, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {HealthIndicator} from '../../../domain/model/health-indicator';
import {MetricThreshold} from '../../../domain/model/metric-threshold.entity';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {WellbeingStore} from '../../../application/wellbeing.store';

@Component({selector:'app-threshold-dialog', imports:[ReactiveFormsModule,MatDialogClose,MatDialogTitle,MatButton,MatIcon,TranslatePipe], templateUrl:'./threshold-dialog.html', styleUrl:'./threshold-dialog.css'})
/**
 * Manages editing of the classification ranges for a metric.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class ThresholdDialog extends BaseForm {
  readonly store = inject(WellbeingStore);
  readonly data = inject<{threshold: MetricThreshold}>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ThresholdDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
/**
 * Initializes the instance with the data required for operation.
 * @author Diana Li
 */
  constructor() { super(); }

  readonly indicators: HealthIndicator[] = ['HAZARDOUS','POOR','OPTIMAL','ACCEPTABLE'];
  readonly form = this.fb.nonNullable.group({ranges: this.fb.array(this.data.threshold.ranges.map(range => this.fb.nonNullable.group({indicator:[range.indicator], minValue:[range.minValue, Validators.required], maxValue:[range.maxValue, Validators.required]}))) });
/**
 * Executes the ranges operation of the component.
 * @author Diana Li
 */
  get ranges(): FormArray { return this.form.controls.ranges; }
/**
 * Validates and saves changes from the form or dialog.
 * @author Diana Li
 */
  save(): void {
    this.form.markAllAsTouched(); if (this.form.invalid) return;
    const raw = this.form.getRawValue().ranges;
    try { this.store.updateThreshold(this.data.threshold.id, raw); this.dialogRef.close(true); } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const key = message.includes('contiguous') || message.includes('overlap') || message.includes('gap')
        ? 'wellbeing.threshold-dialog.error-invalid-ranges'
        : 'wellbeing.threshold-dialog.error-not-found';
      this.form.setErrors({business:key});
    }
  }
/**
 * Returns a readable label for the period.
 * @param indicator Parameter used by the operation.
 * @author Diana Li
 */
  label(indicator: HealthIndicator): string { return this.translate.instant(indicator === 'OPTIMAL' ? 'wellbeing.indicator.optimal' : indicator === 'ACCEPTABLE' ? 'wellbeing.indicator.acceptable' : indicator === 'POOR' ? 'wellbeing.indicator.poor' : 'wellbeing.indicator.hazardous'); }
}
