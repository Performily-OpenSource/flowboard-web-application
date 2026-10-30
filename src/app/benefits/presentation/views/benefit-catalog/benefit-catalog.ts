import {Component, computed, effect, inject, signal, untracked} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitsStore} from '../../../application/benefits.store';
import {BENEFIT_UNITS, BenefitType, BenefitUnit} from '../../../domain/model/benefit-type.entity';
import {BenefitsHeader} from '../../components/benefits-header/benefits-header';
import {BenefitsTabs} from '../../components/benefits-tabs/benefits-tabs';
import {BenefitsFeedback} from '../../components/benefits-feedback/benefits-feedback';
import {ListPagination} from '../../../../shared/presentation/components/list-pagination/list-pagination';
import {BenefitTypeFormDialog} from '../../components/benefit-type-form-dialog/benefit-type-form-dialog';
import {AssignBenefitDialog} from '../../components/assign-benefit-dialog/assign-benefit-dialog';
import {confirmAction} from '../../components/benefits-confirm-dialog/confirm';
import {PluralKeyPipe} from '../../pipes/plural-key-pipe';
import {matchesText} from '../../utils/matches-text';

type StatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';
type BalanceFilter = 'ALL' | 'WITH' | 'WITHOUT';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-benefit-catalog',
  imports: [
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe, PluralKeyPipe,
    BenefitsHeader, BenefitsTabs, BenefitsFeedback, ListPagination
  ],
  templateUrl: './benefit-catalog.html',
  styleUrl: './benefit-catalog.css',
})
/**
 * Displays the benefit catalog with its filters and actions (WA-25).
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class BenefitCatalog {
  readonly store = inject(BenefitsStore);
  private dialog = inject(MatDialog);

  readonly units = BENEFIT_UNITS;
  readonly statusOptions: StatusFilter[] = ['ACTIVE', 'INACTIVE', 'ALL'];
  readonly balanceOptions: BalanceFilter[] = ['ALL', 'WITH', 'WITHOUT'];
  readonly columns = ['name', 'unit', 'balance', 'reach', 'periodicity', 'actions'];
  readonly pageSize = PAGE_SIZE;

  readonly unitFilter = signal<BenefitUnit | null>(null);
  readonly balanceFilter = signal<BalanceFilter>('ALL');
  readonly statusFilter = signal<StatusFilter>('ACTIVE');
  readonly searchText = signal('');
  readonly page = signal(0);

  readonly filteredTypes = computed(() => this.store.benefitTypes().filter(type =>
    matchesText(type.name, this.searchText()) &&
    (this.unitFilter() === null || type.unit === this.unitFilter()) &&
    (this.balanceFilter() === 'ALL' || type.hasBalance === (this.balanceFilter() === 'WITH')) &&
    (this.statusFilter() === 'ALL' || type.active === (this.statusFilter() === 'ACTIVE'))));

  readonly pageTypes = computed(() =>
    this.filteredTypes().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));

  /** Whether any filter differs from the default view. */
  readonly hasFilters = computed(() => this.searchText().trim() !== '' || this.unitFilter() !== null ||
    this.balanceFilter() !== 'ALL' || this.statusFilter() !== 'ACTIVE');

  /** Moves to the page of the benefit that was just created, so the user sees it highlighted. */
  constructor() {
    effect(() => {
      const createdId = this.store.highlightedTypeId();
      if (createdId === null) return;
      untracked(() => {
        let index = this.filteredTypes().findIndex(type => type.id === createdId);
        if (index < 0) {
          this.clearFilters();
          index = this.filteredTypes().findIndex(type => type.id === createdId);
        }
        if (index >= 0) this.page.set(Math.floor(index / PAGE_SIZE));
      });
    });
  }

  /**
   * Filters the catalog by the name of the benefit.
   * @param event Input event of the search box.
   * @author Salym
   */
  onSearch(event: Event) {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.page.set(0);
  }

  /**
   * Goes back to the default filters: every unit and balance, only active benefits, no search.
   * @author Salym
   */
  clearFilters() {
    this.searchText.set('');
    this.unitFilter.set(null);
    this.balanceFilter.set('ALL');
    this.statusFilter.set('ACTIVE');
    this.page.set(0);
  }

  /**
   * Filters the catalog by unit.
   * @param unit Unit selected in the filter, or null for all units.
   * @author Salym
   */
  setUnit(unit: BenefitUnit | null) {
    this.unitFilter.set(unit);
    this.page.set(0);
  }

  /**
   * Filters the catalog by benefits that have or do not have a balance.
   * @param filter Option selected in the filter.
   * @author Salym
   */
  setBalance(filter: BalanceFilter) {
    this.balanceFilter.set(filter);
    this.page.set(0);
  }

  /**
   * Filters the catalog by active or inactive benefits.
   * @param filter Option selected in the filter.
   * @author Salym
   */
  setStatus(filter: StatusFilter) {
    this.statusFilter.set(filter);
    this.page.set(0);
  }

  /**
   * Opens the form to edit a benefit.
   * @param benefitType Benefit type of the catalog.
   * @author Salym
   */
  editBenefit(benefitType: BenefitType) {
    this.dialog.open(BenefitTypeFormDialog, { data: { benefitType }, width: '540px', maxWidth: '95vw' });
  }

  /**
   * Opens the assign dialog with the benefit already selected.
   * @param benefitType Benefit type of the catalog.
   * @author Salym
   */
  assignBenefit(benefitType: BenefitType) {
    this.dialog.open(AssignBenefitDialog, { data: { benefitTypeId: benefitType.id }, width: '560px', maxWidth: '95vw' });
  }

  /**
   * Activates or deactivates a benefit.
   * @param benefitType Benefit type of the catalog.
   * @author Salym
   */
  toggleStatus(benefitType: BenefitType) {
    const reach = this.store.reachOf(benefitType.id);
    const action = benefitType.active ? 'deactivate' : 'activate';
    confirmAction(this.dialog, {
      titleKey: `benefits.confirm.${action}.title`,
      messageKey: benefitType.active ? ('benefits.confirm.deactivate.message.' + (reach === 1 ? 'one' : 'other'))
        : 'benefits.confirm.activate.message',
      params: { name: benefitType.name, count: reach },
      confirmKey: `common.${action}`,
      danger: benefitType.active
    }).subscribe(confirmed => {
      if (confirmed) this.store.toggleBenefitTypeStatus(benefitType);
    });
  }
}
