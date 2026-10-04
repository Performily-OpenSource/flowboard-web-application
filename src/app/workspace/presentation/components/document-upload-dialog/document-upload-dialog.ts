import {Component, inject, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';
import {DOCUMENT_TYPES, DocumentType} from '../../../domain/model/employee-document.entity';
import {EmployeeDocumentTable} from '../employee-document-table/employee-document-table';

/** Data passed to the document upload dialog through MAT_DIALOG_DATA. */
export interface DocumentUploadData {
  /** Identifier of the employee who owns the document. */
  employeeId: number;
}

/** Content types accepted for employee documents: PDF, JPG and PNG. */
export const ALLOWED_DOCUMENT_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
/** Maximum size allowed for an employee document (5 MB). */
export const MAX_DOCUMENT_SIZE_IN_BYTES = 5 * 1024 * 1024;

/**
 * Dialog to upload a document to an employee's file (US17).
 * Lets the user choose the document type and select or drag and drop a PDF, JPG or PNG file of up to 5 MB.
 * Receives {@link DocumentUploadData} and closes with true when the document is added.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-document-upload-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './document-upload-dialog.html',
  styleUrl: './document-upload-dialog.css',
})
export class DocumentUploadDialog {
  /** Workspace store used to register the uploaded document. */
  private store = inject(WorkspaceStore);
  /** Reference to this dialog, used to close it with the result. */
  private dialogRef = inject(MatDialogRef<DocumentUploadDialog>);
  /** Dialog data with the employee identifier. */
  readonly data = inject<DocumentUploadData>(MAT_DIALOG_DATA);

  /** Document types available for selection. */
  readonly documentTypes = DOCUMENT_TYPES;
  /** Selected document type; required. */
  readonly documentType = new FormControl<DocumentType | null>(null, { validators: [Validators.required] });
  /** File selected by the user, or null if none. */
  readonly file = signal<File | null>(null);
  /** Translation key and parameters of the current file validation error, or null if the file is valid. */
  readonly fileError = signal<{ key: string; params?: Record<string, string> } | null>(null);
  /** True while a file is being dragged over the drop zone. */
  readonly dragging = signal(false);

  /**
   * Formats a file size for display.
   *
   * @param sizeInBytes - The size in bytes.
   * @returns The size formatted in KB or MB
   * @author Oscar Lizandro Vasquez Llave
   */
  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }

  /**
   * Handles the file chosen in the file input and resets the input so the same file can be chosen again.
   *
   * @param event - The change event of the file input.
   * @param input - The file input element.
   * @author Oscar Lizandro Vasquez Llave
   */
  onFileSelected(event: Event, input: HTMLInputElement) {
    this.setFile((event.target as HTMLInputElement).files?.[0] ?? null);
    input.value = '';
  }

  /**
   * Allows dropping on the drop zone and marks it as active.
   *
   * @param event - The drag over event.
   * @author Oscar Lizandro Vasquez Llave
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(true);
  }

  /**
   * Takes the first dropped file and validates it.
   *
   * @param event - The drop event.
   * @author Oscar Lizandro Vasquez Llave
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    this.setFile(event.dataTransfer?.files?.[0] ?? null);
  }

  /** Clears the selected file and its validation error. */
  removeFile() {
    this.file.set(null);
    this.fileError.set(null);
  }

  /**
   * Validates the document type and file, adds the document to the employee and closes the dialog with true.
   * Does nothing when the type is missing, no file is selected or the file is invalid.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  confirm() {
    this.documentType.markAsTouched();
    const file = this.file();
    if (this.documentType.invalid || !file || this.fileError()) return;
    this.store.addEmployeeDocument(this.data.employeeId, this.documentType.value!, file);
    this.dialogRef.close(true);
  }

  /**
   * Sets the selected file and validates its content type and size.
   *
   * @param file - The selected file, or null to clear it.
   * @author Oscar Lizandro Vasquez Llave
   */
  private setFile(file: File | null) {
    this.file.set(file);
    this.fileError.set(null);
    if (!file) return;
    if (!ALLOWED_DOCUMENT_CONTENT_TYPES.includes(file.type)) {
      this.fileError.set({ key: 'document-upload.error.invalid-type' });
    } else if (file.size > MAX_DOCUMENT_SIZE_IN_BYTES) {
      this.fileError.set({ key: 'document-upload.error.too-large', params: { size: this.formatSize(file.size) } });
    }
  }
}
