import {Component, computed, inject, signal} from '@angular/core';
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

type StatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';
type BalanceFilter = 'ALL' | 'WITH' | 'WITHOUT';

const PAGE_SIZE = 8;

/** WA-25 Beneficios: catalog of benefit types with filters and actions. */
@Component({
  selector: 'app-benefit-catalog',
  imports: [
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe,
    BenefitsHeader, BenefitsTabs, BenefitsFeedback, ListPagination
  ],
  templateUrl: './benefit-catalog.html',
  styleUrl: './benefit-catalog.css',
})
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
  readonly page = signal(0);

  readonly filteredTypes = computed(() => this.store.benefitTypes().filter(type =>
    (this.unitFilter() === null || type.unit === this.unitFilter()) &&
    (this.balanceFilter() === 'ALL' || type.hasBalance === (this.balanceFilter() === 'WITH')) &&
    (this.statusFilter() === 'ALL' || type.active === (this.statusFilter() === 'ACTIVE'))));

  readonly pageTypes = computed(() =>
    this.filteredTypes().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));

  setUnit(unit: BenefitUnit | null) {
    this.unitFilter.set(unit);
    this.page.set(0);
  }

  setBalance(filter: BalanceFilter) {
    this.balanceFilter.set(filter);
    this.page.set(0);
  }

  setStatus(filter: StatusFilter) {
    this.statusFilter.set(filter);
    this.page.set(0);
  }

  editBenefit(benefitType: BenefitType) {
    this.dialog.open(BenefitTypeFormDialog, { data: { benefitType }, width: '540px', maxWidth: '95vw' });
  }

  assignBenefit(benefitType: BenefitType) {
    this.dialog.open(AssignBenefitDialog, { data: { benefitTypeId: benefitType.id }, width: '560px', maxWidth: '95vw' });
  }

  toggleStatus(benefitType: BenefitType) {
    this.store.toggleBenefitTypeStatus(benefitType);
  }
}
