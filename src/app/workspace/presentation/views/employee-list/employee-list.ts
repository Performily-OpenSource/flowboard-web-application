import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {WorkspaceStore} from '../../../application/workspace.store';
import {
  CONTRACT_TYPES,
  ContractType,
  Employee,
  EMPLOYMENT_STATUSES,
  EmploymentStatus
} from '../../../domain/model/employee.entity';

/** Number of employees shown per page. */
const PAGE_SIZE = 9;

/**
 * Employee list view (WA-03).
 *
 * Lists employees with a text search and combined filters by area, position, status and
 * contract type (US20), paginated in pages of 9 and exportable to CSV. The search text can
 * also come from the ?search= query param set by the toolbar global search.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-employee-list',
  imports: [
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    TranslatePipe,
    LocalDatePipe
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeList {
  /** Workspace store that provides employees, areas and positions. */
  readonly store = inject(WorkspaceStore);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);

  /** Available employment statuses for the status filter. */
  readonly statuses = EMPLOYMENT_STATUSES;
  /** Available contract types for the contract filter. */
  readonly contractTypes = CONTRACT_TYPES;
  /** Columns displayed in the table. */
  readonly columns = ['fullName', 'area', 'position', 'status', 'hireDate', 'actions'];

  /** Text matched against the full name and identity document number. */
  readonly searchText = signal('');
  /** Selected area filter; null shows every area. */
  readonly areaFilter = signal<number | null>(null);
  /** Selected position filter; null shows every position. */
  readonly positionFilter = signal<number | null>(null);
  /** Selected status filter; null shows every status. */
  readonly statusFilter = signal<EmploymentStatus | null>(null);
  /** Selected contract type filter; null shows every contract type. */
  readonly contractTypeFilter = signal<ContractType | null>(null);
  /** Zero-based index of the current page. */
  readonly page = signal(0);

  /** Whether any search text or filter is applied. */
  readonly hasFilters = computed(() =>
    !!this.searchText() || this.areaFilter() !== null || this.positionFilter() !== null ||
    this.statusFilter() !== null || this.contractTypeFilter() !== null);

  /** Positions offered in the position filter, limited to the selected area. */
  readonly positionOptions = computed(() => {
    const areaId = this.areaFilter();
    return this.store.positions().filter(position => areaId === null || position.areaId === areaId);
  });

  /** Employees that match the search and filters, sorted by full name. */
  readonly filteredEmployees = computed(() => {
    const text = this.searchText().trim().toLowerCase();
    return this.store.employees()
      .filter(employee =>
        (!text || `${employee.fullName} ${employee.identityDocumentNumber}`.toLowerCase().includes(text)) &&
        (this.areaFilter() === null || employee.areaId === this.areaFilter()) &&
        (this.positionFilter() === null || employee.positionId === this.positionFilter()) &&
        (this.statusFilter() === null || employee.status === this.statusFilter()) &&
        (this.contractTypeFilter() === null || employee.contractType === this.contractTypeFilter()))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  });

  /** Number of pages, at least one. */
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredEmployees().length / PAGE_SIZE)));
  /** Indexes of every page, for the paginator. */
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index));
  /** Employees of the current page. */
  readonly pageEmployees = computed(() =>
    this.filteredEmployees().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  /** One-based position of the first employee of the current page, or 0 if there are none. */
  readonly rangeStart = computed(() => this.filteredEmployees().length === 0 ? 0 : this.page() * PAGE_SIZE + 1);
  /** One-based position of the last employee of the current page. */
  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredEmployees().length));

  /** Applies the ?search= query param from the toolbar global search and resets the page. */
  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        const search = params.get('search');
        if (search !== null) {
          this.searchText.set(search);
          this.page.set(0);
        }
      });
  }

  /**
   * Updates the search text and goes back to the first page.
   *
   * @param event - The input event of the search field.
   * @author Oscar Lizandro Vasquez Llave
   */
  onSearch(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.page.set(0);
  }

  /**
   * Sets the area filter, clears the position filter and goes back to the first page.
   *
   * @param areaId - The id of the area, or null for every area.
   * @author Oscar Lizandro Vasquez Llave
   */
  setArea(areaId: number | null) {
    this.areaFilter.set(areaId);
    this.positionFilter.set(null);
    this.page.set(0);
  }

  /**
   * Sets the position filter and goes back to the first page.
   *
   * @param positionId - The id of the position, or null for every position.
   * @author Oscar Lizandro Vasquez Llave
   */
  setPosition(positionId: number | null) {
    this.positionFilter.set(positionId);
    this.page.set(0);
  }

  /**
   * Sets the status filter and goes back to the first page.
   *
   * @param status - The employment status, or null for every status.
   * @author Oscar Lizandro Vasquez Llave
   */
  setStatus(status: EmploymentStatus | null) {
    this.statusFilter.set(status);
    this.page.set(0);
  }

  /**
   * Sets the contract type filter and goes back to the first page.
   *
   * @param contractType - The contract type, or null for every contract type.
   * @author Oscar Lizandro Vasquez Llave
   */
  setContractType(contractType: ContractType | null) {
    this.contractTypeFilter.set(contractType);
    this.page.set(0);
  }

  /**
   * Gets the name of an area.
   *
   * @param areaId - The id of the area.
   * @returns The area name, or an empty string if it is not found
   * @author Oscar Lizandro Vasquez Llave
   */
  areaName(areaId: number): string {
    return this.store.getAreaById(areaId)()?.name ?? '';
  }

  /**
   * Gets the title of a position.
   *
   * @param positionId - The id of the position.
   * @returns The position title, or an empty string if it is not found
   * @author Oscar Lizandro Vasquez Llave
   */
  positionTitle(positionId: number): string {
    return this.store.getPositionById(positionId)()?.title ?? '';
  }

  /**
   * Clears the search text and every filter and goes back to the first page.
   *
   * @param searchInput - The search field, emptied as well.
   * @author Oscar Lizandro Vasquez Llave
   */
  clearFilters(searchInput: HTMLInputElement) {
    searchInput.value = '';
    this.searchText.set('');
    this.areaFilter.set(null);
    this.positionFilter.set(null);
    this.statusFilter.set(null);
    this.contractTypeFilter.set(null);
    this.page.set(0);
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
   * Navigates to the file of an employee.
   *
   * @param employee - The employee to view.
   * @author Oscar Lizandro Vasquez Llave
   */
  viewEmployee(employee: Employee) {
    this.router.navigate(['/workspace/employees', employee.id]).then();
  }

  /** Downloads the filtered employees as a UTF-8 CSV file with translated headers. */
  exportEmployees() {
    const header = ['employees.employee', 'employees.document', 'employees.area', 'employees.position', 'employees.status', 'employees.hire-date']
      .map(key => this.translate.instant(key));
    const rows = this.filteredEmployees().map(employee => [
      employee.fullName,
      `${employee.identityDocumentType} ${employee.identityDocumentNumber}`,
      employee.area?.name ?? '',
      employee.position?.title ?? '',
      this.translate.instant(`employee-status.${employee.status}`),
      employee.hireDate
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
