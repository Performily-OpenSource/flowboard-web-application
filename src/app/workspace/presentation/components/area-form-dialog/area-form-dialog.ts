import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Area} from '../../../domain/model/area.entity';

export interface AreaFormData {
  area?: Area;
}

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
  private fb = inject(FormBuilder);
  private store = inject(WorkspaceStore);
  private dialogRef = inject(MatDialogRef<AreaFormDialog>);
  readonly data = inject<AreaFormData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.area;

  readonly form = this.fb.group({
    name: new FormControl<string>(this.data.area?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    description: new FormControl<string>(this.data.area?.description ?? '', { nonNullable: true, validators: [Validators.maxLength(255)] }),
    active: new FormControl<boolean>(this.data.area?.active ?? true, { nonNullable: true })
  });

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
