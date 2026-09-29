import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {LayoutStore} from '../../../../shared/application/layout.store';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {EmployeeDocument} from '../../../domain/model/employee-document.entity';
import {JobAssignmentHistory} from '../../components/job-assignment-history/job-assignment-history';
import {EmployeeDocumentTable} from '../../components/employee-document-table/employee-document-table';
import {EmployeeTerminationDialog} from '../../components/employee-termination-dialog/employee-termination-dialog';
import {EmployeeReinstatementDialog} from '../../components/employee-reinstatement-dialog/employee-reinstatement-dialog';
import {EmployeeStatusDialog} from '../../components/employee-status-dialog/employee-status-dialog';
import {DirectManagerDialog} from '../../components/direct-manager-dialog/direct-manager-dialog';

type DetailTab = 'personal' | 'employment' | 'documents';

@Component({
  selector: 'app-employee-detail',
  imports: [
    CurrencyPipe,
    RouterLink,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    TranslatePipe,
    LocalDatePipe,
    JobAssignmentHistory,
    EmployeeDocumentTable
  ],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetail implements OnInit {
  readonly store = inject(WorkspaceStore);
  private layoutStore = inject(LayoutStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  readonly employeeId: number = +this.route.snapshot.params['id'];
  readonly employee = this.store.getEmployeeById(this.employeeId);
  readonly tab = signal<DetailTab>('employment');

  readonly directManager = computed(() => {
    const managerId = this.employee()?.directManagerId;
    return managerId ? this.store.getEmployeeById(managerId)() : undefined;
  });

  readonly latestDocuments = computed(() => this.store.employeeDocuments().slice(0, 3));

  constructor() {
    effect(() => this.layoutStore.setBreadcrumbDetail(this.employee()?.fullName ?? null));
  }

  ngOnInit(): void {
    this.store.clearError();
    this.store.loadEmployeeRecords(this.employeeId);
  }

  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  /** "C. Gomez" style short name used in the header tags. */
  shortName(employee: Employee): string {
    return `${employee.firstName.charAt(0)}. ${employee.lastName.split(' ')[0]}`;
  }

  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }

  fileExtension(document: EmployeeDocument): string {
    return document.isPdf() ? 'PDF' : document.contentType.replace('image/', '').toUpperCase();
  }

  openTerminationDialog(employee: Employee) {
    this.dialog.open(EmployeeTerminationDialog, { data: { employee }, width: '480px', maxWidth: '95vw' });
  }

  openReinstatementDialog(employee: Employee) {
    this.dialog.open(EmployeeReinstatementDialog, { data: { employee }, width: '480px', maxWidth: '95vw' });
  }

  openStatusDialog(employee: Employee) {
    this.dialog.open(EmployeeStatusDialog, { data: { employee }, width: '440px', maxWidth: '95vw' });
  }

  openDirectManagerDialog(employee: Employee) {
    this.dialog.open(DirectManagerDialog, { data: { employee }, width: '480px', maxWidth: '95vw' });
  }

  openOrganizationChart() {
    this.router.navigate(['/workspace/organization-chart'], { queryParams: { highlight: this.employeeId } }).then();
  }

  deleteDocument(document: EmployeeDocument) {
    this.store.deleteEmployeeDocument(document.id);
  }
}
