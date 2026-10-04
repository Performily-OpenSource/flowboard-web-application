import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {LayoutStore} from '../../../../shared/application/layout.store';
import {WorkspaceStore} from '../../../application/workspace.store';
import {DOCUMENT_TYPES, DocumentType, EmployeeDocument} from '../../../domain/model/employee-document.entity';
import {EmployeeDocumentTable} from '../../components/employee-document-table/employee-document-table';
import {DocumentUploadDialog} from '../../components/document-upload-dialog/document-upload-dialog';

/**
 * Employee documents view (WA-53, WA-54, WA-55).
 *
 * Lists the documents of an employee filtered by type and year, and lets the user
 * upload new documents and delete existing ones (US17).
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-employee-documents',
  imports: [
    RouterLink,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    TranslatePipe,
    EmployeeDocumentTable
  ],
  templateUrl: './employee-documents.html',
  styleUrl: './employee-documents.css',
})
export class EmployeeDocuments implements OnInit {
  /** Workspace store that provides the employee and its documents. */
  readonly store = inject(WorkspaceStore);
  private layoutStore = inject(LayoutStore);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  /** Id of the employee taken from the route. */
  readonly employeeId: number = +this.route.snapshot.params['id'];
  /** The employee that owns the documents. */
  readonly employee = this.store.getEmployeeById(this.employeeId);
  /** Available document types for the type filter. */
  readonly documentTypes = DOCUMENT_TYPES;

  /** Selected document type filter; null shows every type. */
  readonly typeFilter = signal<DocumentType | null>(null);
  /** Selected upload year filter; null shows every year. */
  readonly yearFilter = signal<string | null>(null);

  /** Distinct upload years of the documents, newest first. */
  readonly years = computed(() =>
    [...new Set(this.store.employeeDocuments().map(document => document.uploadedAt.substring(0, 4)))].sort().reverse());

  /** Documents that match the type and year filters. */
  readonly documents = computed(() => this.store.employeeDocuments().filter(document =>
    (this.typeFilter() === null || document.documentType === this.typeFilter()) &&
    (this.yearFilter() === null || document.uploadedAt.startsWith(this.yearFilter()!))));

  /** Formatted total size of the filtered documents. */
  readonly totalSize = computed(() =>
    EmployeeDocumentTable.formatSize(this.documents().reduce((total, document) => total + document.sizeInBytes, 0)));

  /** Keeps the breadcrumb in sync with the employee name. */
  constructor() {
    effect(() => this.layoutStore.setBreadcrumbDetail(this.employee()?.fullName ?? null));
  }

  /** Clears previous errors and loads the records of the employee. */
  ngOnInit(): void {
    this.store.clearError();
    this.store.loadEmployeeRecords(this.employeeId);
  }

  /** Opens the dialog to upload a new document for the employee. */
  openUploadDialog() {
    this.dialog.open(DocumentUploadDialog, { data: { employeeId: this.employeeId }, width: '480px', maxWidth: '95vw' });
  }

  /**
   * Deletes a document of the employee.
   *
   * @param document - The document to delete.
   * @author Oscar Lizandro Vasquez Llave
   */
  deleteDocument(document: EmployeeDocument) {
    this.store.deleteEmployeeDocument(document.id);
  }
}
