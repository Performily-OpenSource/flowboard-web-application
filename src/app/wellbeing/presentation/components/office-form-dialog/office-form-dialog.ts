import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {WellbeingStore} from '../../../application/wellbeing.store';
import {computed} from '@angular/core';

@Component({selector:'app-office-form-dialog', imports:[ReactiveFormsModule,MatButton,MatDialogClose,MatDialogTitle,MatIcon,TranslatePipe], templateUrl:'./office-form-dialog.html', styleUrl:'./office-form-dialog.css'})
/**
 * Manages the creation and editing of workspaces.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class OfficeFormDialog extends BaseForm {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(WellbeingStore);
  private readonly dialogRef = inject(MatDialogRef<OfficeFormDialog>);
  readonly form = this.fb.nonNullable.group({name:['', [Validators.required, Validators.maxLength(80)]], building:['Sede Central Lima', Validators.required], floor:['Piso 2', Validators.required], reference:['12 personas', Validators.maxLength(150)]});
  readonly buildings = computed(() => [...new Set(this.store.offices().map(office => office.location.building))]);
/**
 * Initializes the instance with the data required for operation.
 * @author Diana Li
 */
  constructor() { super(); }

/**
 * Validates and saves changes from the form or dialog.
 * @author Diana Li
 */
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    try { this.store.createOffice(this.form.getRawValue()); this.dialogRef.close(true); } catch (error) { if (!(error instanceof Error && error.message === 'DUPLICATE')) throw error; }
  }
}
