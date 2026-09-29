import {Component, inject, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';
import {DOCUMENT_TYPES, DocumentType} from '../../../domain/model/employee-document.entity';
import {EmployeeDocumentTable} from '../employee-document-table/employee-document-table';

export interface DocumentUploadData {
  employeeId: number;
}

export const ALLOWED_DOCUMENT_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_DOCUMENT_SIZE_IN_BYTES = 5 * 1024 * 1024;

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
  private store = inject(WorkspaceStore);
  private dialogRef = inject(MatDialogRef<DocumentUploadDialog>);
  readonly data = inject<DocumentUploadData>(MAT_DIALOG_DATA);

  readonly documentTypes = DOCUMENT_TYPES;
  readonly documentType = new FormControl<DocumentType | null>(null, { validators: [Validators.required] });
  readonly file = signal<File | null>(null);
  readonly fileError = signal<{ key: string; params?: Record<string, string> } | null>(null);
  readonly dragging = signal(false);

  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }

  onFileSelected(event: Event, input: HTMLInputElement) {
    this.setFile((event.target as HTMLInputElement).files?.[0] ?? null);
    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    this.setFile(event.dataTransfer?.files?.[0] ?? null);
  }

  removeFile() {
    this.file.set(null);
    this.fileError.set(null);
  }

  confirm() {
    this.documentType.markAsTouched();
    const file = this.file();
    if (this.documentType.invalid || !file || this.fileError()) return;
    this.store.addEmployeeDocument(this.data.employeeId, this.documentType.value!, file);
    this.dialogRef.close(true);
  }

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
