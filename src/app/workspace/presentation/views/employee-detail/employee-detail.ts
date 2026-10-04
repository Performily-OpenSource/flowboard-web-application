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

/** Tabs of the employee file: the Workspace tabs plus the tabs filled by other bounded contexts. */
type DetailTab = 'personal' | 'employment' | 'documents' | 'attendance' | 'requests' | 'benefits';

/** A tab of the employee file whose content is provided by another bounded context. */
interface ContextTab {
  /** The tab this entry represents. */
  tab: DetailTab;
  /** The extension slot whose registered sections fill the tab. */
  slot: EmployeeFileSlot;
  /** The i18n key of the tab label. */
  label: string;
}

/** Tabs filled by other bounded contexts (Attendance, Requests and Benefits) through EMPLOYEE_FILE_SECTIONS. */
const CONTEXT_TABS: ContextTab[] = [
  { tab: 'attendance', slot: 'attendance-tab', label: 'employee-detail.attendance-tab' },
  { tab: 'requests', slot: 'requests-tab', label: 'employee-detail.requests-tab' },
  { tab: 'benefits', slot: 'benefits-tab', label: 'employee-detail.benefits-tab' }
];

/**
 * Employee file view (WA-04).
 *
 * Shows the personal, employment and documents data of an employee, together with the Attendance,
 * Requests and Benefits tabs whose content other bounded contexts register through the
 * EMPLOYEE_FILE_SECTIONS extension point. It also opens the dialogs to change the status, terminate,
 * reinstate or assign the direct manager of the employee, and reacts to changes of the route id.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
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
  /** Workspace store that provides employees, job assignments and documents. */
  readonly store = inject(WorkspaceStore);
  private layoutStore = inject(LayoutStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  /** Id of the employee taken from the route; updates when the route id changes. */
  readonly employeeId = toSignal(
    this.route.paramMap.pipe(map(params => Number(params.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) });
  /** The employee shown in the file, or undefined while it is not loaded. */
  readonly employee = computed(() => this.store.getEmployeeById(this.employeeId())());
  /** The active tab of the file. */
  readonly tab = signal<DetailTab>('employment');

  /** Sections registered by other bounded contexts, sorted by their order. */
  private readonly sections = [...(inject(EMPLOYEE_FILE_SECTIONS, { optional: true }) ?? [])]
    .sort((a, b) => a.order - b.order);

  /** Tabs filled by other bounded contexts, exposed to the template. */
  readonly contextTabs = CONTEXT_TABS;
  /** Sections registered for the 'employment' slot. */
  readonly employmentSections = this.sectionsFor('employment');
  /** Sections registered for the 'aside' slot. */
  readonly asideSections = this.sectionsFor('aside');
  /** Sections registered for the slot of the active context tab; empty for Workspace tabs. */
  readonly tabSections = computed(() => {
    const contextTab = CONTEXT_TABS.find(item => item.tab === this.tab());
    return contextTab ? this.sectionsFor(contextTab.slot) : [];
  });

  /** The direct manager of the employee, or undefined if none is assigned. */
  readonly directManager = computed(() => {
    const managerId = this.employee()?.directManagerId;
    return managerId ? this.store.getEmployeeById(managerId)() : undefined;
  });

  /** The three most recently uploaded documents of the employee. */
  readonly latestDocuments = computed(() => this.store.employeeDocuments().slice(0, 3));

  /**
   * Sets the breadcrumb to the employee name and, whenever the route id changes,
   * resets the active tab and loads the job assignments and documents of the employee.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor() {
    effect(() => this.layoutStore.setBreadcrumbDetail(this.employee()?.fullName ?? null));
    effect(() => {
      const employeeId = this.employeeId();
      this.tab.set('employment');
      this.store.clearError();
      this.store.loadEmployeeRecords(employeeId);
    });
  }

  /**
   * Gets the sections registered for an extension slot.
   *
   * @param slot - The slot of the employee file.
   * @returns The sections registered for the slot, in display order
   * @author Oscar Lizandro Vasquez Llave
   */
  sectionsFor(slot: EmployeeFileSlot): EmployeeFileSection[] {
    return this.sections.filter(section => section.slot === slot);
  }

  /**
   * Builds the initials of an employee for the avatar.
   *
   * @param employee - The employee.
   * @returns The uppercase initials of the first and last name
   * @author Oscar Lizandro Vasquez Llave
   */
  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Builds a short display name such as "J. Perez".
   *
   * @param employee - The employee.
   * @returns The first-name initial followed by the first last name
   * @author Oscar Lizandro Vasquez Llave
   */
  shortName(employee: Employee): string {
    return `${employee.firstName.charAt(0)}. ${employee.lastName.split(' ')[0]}`;
  }

  /**
   * Formats a file size for display.
   *
   * @param sizeInBytes - The size of the file in bytes.
   * @returns The human readable size
   * @author Oscar Lizandro Vasquez Llave
   */
  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }

  /**
   * Gets the label of the file format of a document.
   *
   * @param document - The employee document.
   * @returns PDF for PDF files, otherwise the uppercase image subtype (e.g. PNG)
   * @author Oscar Lizandro Vasquez Llave
   */
  fileExtension(document: EmployeeDocument): string {
    return document.isPdf() ? 'PDF' : document.contentType.replace('image/', '').toUpperCase();
  }

  /**
   * Opens the dialog to terminate the employee.
   *
   * @param employee - The employee to terminate.
   * @author Oscar Lizandro Vasquez Llave
   */
  openTerminationDialog(employee: Employee) {
    this.dialog.open(EmployeeTerminationDialog, { data: { employee }, width: '480px', maxWidth: '95vw' });
  }

  /**
   * Opens the dialog to reinstate a terminated employee.
   *
   * @param employee - The employee to reinstate.
   * @author Oscar Lizandro Vasquez Llave
   */
  openReinstatementDialog(employee: Employee) {
    this.dialog.open(EmployeeReinstatementDialog, { data: { employee }, width: '480px', maxWidth: '95vw' });
  }

  /**
   * Opens the dialog to change the employment status (active or suspended).
   *
   * @param employee - The employee whose status changes.
   * @author Oscar Lizandro Vasquez Llave
   */
  openStatusDialog(employee: Employee) {
    this.dialog.open(EmployeeStatusDialog, { data: { employee }, width: '440px', maxWidth: '95vw' });
  }

  /**
   * Opens the dialog to assign or change the direct manager.
   *
   * @param employee - The employee whose direct manager changes.
   * @author Oscar Lizandro Vasquez Llave
   */
  openDirectManagerDialog(employee: Employee) {
    this.dialog.open(DirectManagerDialog, { data: { employee }, width: '480px', maxWidth: '95vw' });
  }

  /** Navigates to the organization chart highlighting the current employee. */
  openOrganizationChart() {
    this.router.navigate(['/workspace/organization-chart'], { queryParams: { highlight: this.employeeId() } }).then();
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