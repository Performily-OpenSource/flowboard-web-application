import {Component, computed, effect, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CurrencyPipe, NgComponentOutlet} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {map} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {LayoutStore} from '../../../../shared/application/layout.store';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {
  EMPLOYEE_FILE_SECTIONS,
  EmployeeFileSection,
  EmployeeFileSlot
} from '../../../../shared/presentation/components/employee-file-section/employee-file-section';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {EmployeeDocument} from '../../../domain/model/employee-document.entity';
import {JobAssignmentHistory} from '../../components/job-assignment-history/job-assignment-history';
import {EmployeeDocumentTable} from '../../components/employee-document-table/employee-document-table';
import {EmployeeTerminationDialog} from '../../components/employee-termination-dialog/employee-termination-dialog';
import {EmployeeReinstatementDialog} from '../../components/employee-reinstatement-dialog/employee-reinstatement-dialog';
import {EmployeeStatusDialog} from '../../components/employee-status-dialog/employee-status-dialog';
import {DirectManagerDialog} from '../../components/direct-manager-dialog/direct-manager-dialog';

type DetailTab = 'personal' | 'employment' | 'documents' | 'attendance' | 'requests' | 'benefits';

interface ContextTab {
  tab: DetailTab;
  slot: EmployeeFileSlot;
  label: string;
}

const CONTEXT_TABS: ContextTab[] = [
  { tab: 'attendance', slot: 'attendance-tab', label: 'employee-detail.attendance-tab' },
  { tab: 'requests', slot: 'requests-tab', label: 'employee-detail.requests-tab' },
  { tab: 'benefits', slot: 'benefits-tab', label: 'employee-detail.benefits-tab' }
];

@Component({
  selector: 'app-employee-detail',
  imports: [
    CurrencyPipe,
    NgComponentOutlet,
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
export class EmployeeDetail {
  readonly store = inject(WorkspaceStore);
  private layoutStore = inject(LayoutStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  readonly employeeId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) });
  readonly employee = computed(() => this.store.getEmployeeById(this.employeeId())());
  readonly tab = signal<DetailTab>('employment');

  private readonly sections = [...(inject(EMPLOYEE_FILE_SECTIONS, { optional: true }) ?? [])]
    .sort((a, b) => a.order - b.order);

  readonly contextTabs = CONTEXT_TABS;
  readonly employmentSections = this.sectionsFor('employment');
  readonly asideSections = this.sectionsFor('aside');
  readonly tabSections = computed(() => {
    const contextTab = CONTEXT_TABS.find(item => item.tab === this.tab());
    return contextTab ? this.sectionsFor(contextTab.slot) : [];
  });

  readonly directManager = computed(() => {
    const managerId = this.employee()?.directManagerId;
    return managerId ? this.store.getEmployeeById(managerId)() : undefined;
  });

  readonly latestDocuments = computed(() => this.store.employeeDocuments().slice(0, 3));

  constructor() {
    effect(() => this.layoutStore.setBreadcrumbDetail(this.employee()?.fullName ?? null));
    effect(() => {
      const employeeId = this.employeeId();
      this.tab.set('employment');
      this.store.clearError();
      this.store.loadEmployeeRecords(employeeId);
    });
  }

  sectionsFor(slot: EmployeeFileSlot): EmployeeFileSection[] {
    return this.sections.filter(section => section.slot === slot);
  }

  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

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
    this.router.navigate(['/workspace/organization-chart'], { queryParams: { highlight: this.employeeId() } }).then();
  }

  deleteDocument(document: EmployeeDocument) {
    this.store.deleteEmployeeDocument(document.id);
  }
}