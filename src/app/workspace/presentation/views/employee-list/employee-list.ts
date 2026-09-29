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

const PAGE_SIZE = 9;

/** Employee list with combined filters (WA-03, WA-55, US20). */
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
  readonly store = inject(WorkspaceStore);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);

  readonly statuses = EMPLOYMENT_STATUSES;
  readonly contractTypes = CONTRACT_TYPES;
  readonly columns = ['fullName', 'area', 'position', 'status', 'hireDate', 'actions'];

  readonly searchText = signal('');
  readonly areaFilter = signal<number | null>(null);
  readonly positionFilter = signal<number | null>(null);
  readonly statusFilter = signal<EmploymentStatus | null>(null);
  readonly contractTypeFilter = signal<ContractType | null>(null);
  readonly page = signal(0);

  readonly hasFilters = computed(() =>
    !!this.searchText() || this.areaFilter() !== null || this.positionFilter() !== null ||
    this.statusFilter() !== null || this.contractTypeFilter() !== null);

  readonly positionOptions = computed(() => {
    const areaId = this.areaFilter();
    return this.store.positions().filter(position => areaId === null || position.areaId === areaId);
  });

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

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredEmployees().length / PAGE_SIZE)));
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index));
  readonly pageEmployees = computed(() =>
    this.filteredEmployees().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
  readonly rangeStart = computed(() => this.filteredEmployees().length === 0 ? 0 : this.page() * PAGE_SIZE + 1);
  readonly rangeEnd = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.filteredEmployees().length));

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

  onSearch(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.page.set(0);
  }

  setArea(areaId: number | null) {
    this.areaFilter.set(areaId);
    this.positionFilter.set(null);
    this.page.set(0);
  }

  setPosition(positionId: number | null) {
    this.positionFilter.set(positionId);
    this.page.set(0);
  }

  setStatus(status: EmploymentStatus | null) {
    this.statusFilter.set(status);
    this.page.set(0);
  }

  setContractType(contractType: ContractType | null) {
    this.contractTypeFilter.set(contractType);
    this.page.set(0);
  }

  areaName(areaId: number): string {
    return this.store.getAreaById(areaId)()?.name ?? '';
  }

  positionTitle(positionId: number): string {
    return this.store.getPositionById(positionId)()?.title ?? '';
  }

  clearFilters(searchInput: HTMLInputElement) {
    searchInput.value = '';
    this.searchText.set('');
    this.areaFilter.set(null);
    this.positionFilter.set(null);
    this.statusFilter.set(null);
    this.contractTypeFilter.set(null);
    this.page.set(0);
  }

  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  viewEmployee(employee: Employee) {
    this.router.navigate(['/workspace/employees', employee.id]).then();
  }

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
