import {Component, Inject, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SlicePipe} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceRecord} from '../../../domain/model/attendance-record.entity';
import {AttendanceStore} from '../../../application/attendance.store';

/**
 * Presents the dialog used to justify an attendance record.
 *
 * @remarks Collects a justification reason and optional document name before delegating the update to AttendanceStore.
 * @author Dario Avila de la cruz
 */
@Component({
  selector: 'app-attendance-justification-dialog',
  imports: [FormsModule, SlicePipe, MatButton, MatIcon, TranslatePipe],
  templateUrl: './attendance-justification-dialog.html',
  styleUrl: './attendance-justification-dialog.css'
})
export class AttendanceJustificationDialog {
  private readonly dialogRef = inject(MatDialogRef<AttendanceJustificationDialog>);
  private readonly store = inject(AttendanceStore);
  reason = '';
  fileName: string | null = null;

/**
 * Performs the constructor operation.
 *
 * @author Dario Avila de la cruz
 */
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: { record: AttendanceRecord; employeeName: string }) {}

/**
 * Captures the selected justification file name for the dialog.
 *
 * @param event the file-selection event.
 * @author Dario Avila de la cruz
 */
  selectFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.fileName = file?.name ?? null;
  }

/**
 * Validates and submits the current form data.
 * 
 * @author Dario Avila de la cruz
 */
  submit(): void {
    if (!this.reason.trim()) return;
    this.store.justify(this.data.record, this.reason.trim(), this.fileName);
    this.dialogRef.close(true);
  }

/**
 * Closes the attendance justification dialog without saving.
 *
 * @author Dario Avila de la cruz
 */
  close(): void { this.dialogRef.close(false); }
}
