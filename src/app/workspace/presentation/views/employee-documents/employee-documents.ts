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
  readonly store = inject(WorkspaceStore);
  private layoutStore = inject(LayoutStore);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  readonly employeeId: number = +this.route.snapshot.params['id'];
  readonly employee = this.store.getEmployeeById(this.employeeId);
  readonly documentTypes = DOCUMENT_TYPES;

  readonly typeFilter = signal<DocumentType | null>(null);
  readonly yearFilter = signal<string | null>(null);

  readonly years = computed(() =>
    [...new Set(this.store.employeeDocuments().map(document => document.uploadedAt.substring(0, 4)))].sort().reverse());

  readonly documents = computed(() => this.store.employeeDocuments().filter(document =>
    (this.typeFilter() === null || document.documentType === this.typeFilter()) &&
    (this.yearFilter() === null || document.uploadedAt.startsWith(this.yearFilter()!))));

  readonly totalSize = computed(() =>
    EmployeeDocumentTable.formatSize(this.documents().reduce((total, document) => total + document.sizeInBytes, 0)));

  constructor() {
    effect(() => this.layoutStore.setBreadcrumbDetail(this.employee()?.fullName ?? null));
  }

  ngOnInit(): void {
    this.store.clearError();
    this.store.loadEmployeeRecords(this.employeeId);
  }

  openUploadDialog() {
    this.dialog.open(DocumentUploadDialog, { data: { employeeId: this.employeeId }, width: '480px', maxWidth: '95vw' });
  }

  deleteDocument(document: EmployeeDocument) {
    this.store.deleteEmployeeDocument(document.id);
  }
}
