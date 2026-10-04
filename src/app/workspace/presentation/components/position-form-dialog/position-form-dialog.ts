import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Position} from '../../../domain/model/position.entity';

/**
 * Data passed to the position form dialog through MAT_DIALOG_DATA.
 * When a position is provided the dialog works in edit mode; otherwise it creates a new position.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface PositionFormData {
  /** The position to edit, or undefined to create a new one. */
  position?: Position;
  /** Area preselected for a new position, if any. */
  areaId?: number | null;
}

/**
 * Dialog to create or edit a position within an area (US10 - area/position).
 * Receives an optional position and preselected area through {@link PositionFormData},
 * validates that the title is unique within the area, persists it through the store
 * and closes with true when saved.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
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
  /** Form builder used to create the position form. */
  private fb = inject(FormBuilder);
  /** Workspace store that holds areas and positions; also used by the template to list areas. */
  readonly store = inject(WorkspaceStore);
  /** Reference to this dialog, used to close it with the result. */
  private dialogRef = inject(MatDialogRef<PositionFormDialog>);
  /** Dialog data with the position to edit and the preselected area, if any. */
  readonly data = inject<PositionFormData>(MAT_DIALOG_DATA);

  /** True when the dialog edits an existing position, false when it creates one. */
  readonly isEdit = !!this.data.position;
  /** Currencies available for the reference salary. */
  readonly currencies = ['PEN', 'USD'];

  /** Form with the position title, area and reference salary amount and currency. */
  readonly form = this.fb.group({
    title: new FormControl<string>(this.data.position?.title ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    areaId: new FormControl<number | null>(this.data.position?.areaId ?? this.data.areaId ?? null, { validators: [Validators.required] }),
    referenceSalaryAmount: new FormControl<number | null>(this.data.position?.referenceSalaryAmount ?? null, { validators: [Validators.required, Validators.min(0.01)] }),
    referenceSalaryCurrency: new FormControl<string>(this.data.position?.referenceSalaryCurrency ?? 'PEN', { nonNullable: true, validators: [Validators.required] })
  });

  /**
   * Validates the form, checks that the title is not taken in the selected area and saves the position.
   * The reference salary is rounded to two decimals. Closes the dialog with true on success.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
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
