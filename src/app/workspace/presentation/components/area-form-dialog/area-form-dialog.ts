import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Area} from '../../../domain/model/area.entity';

/**
 * Data passed to the area form dialog through MAT_DIALOG_DATA.
 * When an area is provided the dialog works in edit mode; otherwise it creates a new area.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface AreaFormData {
  /** The area to edit, or undefined to create a new one. */
  area?: Area;
}

/**
 * Dialog to create or edit an organizational area (US09 - areas catalog).
 * Receives an optional area through {@link AreaFormData}, validates that the name is unique
 * and that an area with active employees is not deactivated, persists it through the store
 * and closes with true when saved.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-area-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './area-form-dialog.html',
  styleUrl: './area-form-dialog.css',
})
export class AreaFormDialog extends BaseForm {
  /** Form builder used to create the area form. */
  private fb = inject(FormBuilder);
  /** Workspace store that holds areas and employees. */
  private store = inject(WorkspaceStore);
  /** Reference to this dialog, used to close it with the result. */
  private dialogRef = inject(MatDialogRef<AreaFormDialog>);
  /** Dialog data with the area to edit, if any. */
  readonly data = inject<AreaFormData>(MAT_DIALOG_DATA);

  /** True when the dialog edits an existing area, false when it creates one. */
  readonly isEdit = !!this.data.area;

  /** Form with the area name, description and active flag. */
  readonly form = this.fb.group({
    name: new FormControl<string>(this.data.area?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    description: new FormControl<string>(this.data.area?.description ?? '', { nonNullable: true, validators: [Validators.maxLength(255)] }),
    active: new FormControl<boolean>(this.data.area?.active ?? true, { nonNullable: true })
  });

  /**
   * Validates the form, checks the business rules and saves the area.
   * Marks the name as taken when another area already uses it, and blocks deactivation
   * when the area still has active employees. Closes the dialog with true on success.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const name = value.name.trim();

    const nameTaken = this.store.areas().some(area =>
      area.id !== this.data.area?.id && area.name.toLowerCase() === name.toLowerCase());
    if (nameTaken) {
      this.form.controls.name.setErrors({ taken: true });
      return;
    }

    if (this.data.area?.active && !value.active && this.store.countActiveEmployeesInArea(this.data.area.id) > 0) {
      this.form.controls.active.setErrors({ hasEmployees: true });
      return;
    }

    const area = new Area({
      id: this.data.area?.id ?? 0,
      name,
      description: value.description.trim(),
      active: value.active
    });
    if (this.isEdit) {
      this.store.updateArea(area);
    } else {
      this.store.addArea(area);
    }
    this.dialogRef.close(true);
  }
}
