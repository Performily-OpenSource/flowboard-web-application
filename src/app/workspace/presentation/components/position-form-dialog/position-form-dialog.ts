import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Position} from '../../../domain/model/position.entity';

export interface PositionFormData {
  position?: Position;
  areaId?: number | null;
}

/** Creates or edits a position with its minimum reference salary (WA-48). */
@Component({
  selector: 'app-position-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './position-form-dialog.html',
  styleUrl: './position-form-dialog.css',
})
export class PositionFormDialog extends BaseForm {
  private fb = inject(FormBuilder);
  readonly store = inject(WorkspaceStore);
  private dialogRef = inject(MatDialogRef<PositionFormDialog>);
  readonly data = inject<PositionFormData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.position;
  readonly currencies = ['PEN', 'USD'];

  readonly form = this.fb.group({
    title: new FormControl<string>(this.data.position?.title ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    areaId: new FormControl<number | null>(this.data.position?.areaId ?? this.data.areaId ?? null, { validators: [Validators.required] }),
    referenceSalaryAmount: new FormControl<number | null>(this.data.position?.referenceSalaryAmount ?? null, { validators: [Validators.required, Validators.min(0.01)] }),
    referenceSalaryCurrency: new FormControl<string>(this.data.position?.referenceSalaryCurrency ?? 'PEN', { nonNullable: true, validators: [Validators.required] })
  });

  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const title = value.title.trim();

    const titleTaken = this.store.positions().some(position =>
      position.id !== this.data.position?.id &&
      position.areaId === value.areaId &&
      position.title.toLowerCase() === title.toLowerCase());
    if (titleTaken) {
      this.form.controls.title.setErrors({ taken: true });
      return;
    }

    const position = new Position({
      id: this.data.position?.id ?? 0,
      title,
      areaId: value.areaId!,
      referenceSalaryAmount: Math.round(value.referenceSalaryAmount! * 100) / 100,
      referenceSalaryCurrency: value.referenceSalaryCurrency,
      active: this.data.position?.active ?? true
    });
    if (this.isEdit) {
      this.store.updatePosition(position);
    } else {
      this.store.addPosition(position);
    }
    this.dialogRef.close(true);
  }
}
