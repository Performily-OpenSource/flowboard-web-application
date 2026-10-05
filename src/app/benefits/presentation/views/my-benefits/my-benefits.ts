import {Component, computed, inject} from '@angular/core';
import {CurrencyPipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {SessionStore} from '../../../../shared/application/session.store';
import {CurrentEmployeeStore} from '../../../../shared/application/current-employee.store';
import {BenefitsStore} from '../../../application/benefits.store';
import {BenefitAssignment} from '../../../domain/model/benefit-assignment.entity';
import {BenefitUnit} from '../../../domain/model/benefit-type.entity';
import {MyBenefitDetailDialog} from '../../components/my-benefit-detail-dialog/my-benefit-detail-dialog';

/**
 * Benefit with balance shown in the "Con saldo disponible" card.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export interface BalanceItem {
  /** Unique key used to track the item in the list. */
  key: string;
  /** Name of the benefit, or null for the vacation balance (translated in the template). */
  name: string | null;
  /** Unit in which the balance is measured. */
  unit: BenefitUnit;
  /** Quantity still available. */
  available: number;
  /** Total quantity granted. */
  total: number;
  /** Percentage of the total still available (0 to 100). */
  percentage: number;
  /** Assignment behind the item, or null for the vacation balance. */
  assignment: BenefitAssignment | null;
}

@Component({
  selector: 'app-my-benefits',
  imports: [CurrencyPipe, DecimalPipe, LowerCasePipe, RouterLink, MatButton, MatIcon, MatProgressBar, TranslatePipe,
    LocalDatePipe],
  templateUrl: './my-benefits.html',
  styleUrl: './my-benefits.css',
})
/**
 * "My benefits" screen (WA-27). Shows the signed-in user what is available this year and what was
 * already delivered. It is open to both roles (collaborator and HR staff), because everybody has
 * their own benefits.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Salym
 */
export class MyBenefits {
  protected readonly store = inject(BenefitsStore);
  private readonly session = inject(SessionStore);
  private readonly currentEmployee = inject(CurrentEmployeeStore);
  private readonly dialog = inject(MatDialog);

  /** Employee of the signed-in user. */
  readonly employeeId = computed(() => this.session.employeeId() ?? this.currentEmployee.employeeId());

  /** Assignments of the signed-in user that are not cancelled. */
  private readonly myAssignments = computed(() => this.store.assignments()
    .filter(assignment => assignment.employeeId === this.employeeId() && !assignment.isCancelled()));

  /** Vacation balance followed by the pending assignments whose benefit type keeps a balance. */
  readonly balanceItems = computed<BalanceItem[]>(() => {
    const items: BalanceItem[] = [];
    const balance = this.store.getBalanceByEmployeeId(this.employeeId());
    if (balance) {
      items.push(this.toItem('vacation', null, 'DAYS', balance.availableDays(), balance.accruedDays, null));
    }
    const today = new Date().toISOString().substring(0, 10);
    this.myAssignments()
      .filter(assignment => assignment.benefitType?.hasBalance && !assignment.isDelivered()
        && assignment.validity.endDate >= today)
      .forEach(assignment => items.push(this.toItem(`assignment-${assignment.id}`,
        assignment.benefitType?.name ?? '', assignment.benefitType?.unit ?? 'UNITS',
        assignment.quantity, assignment.quantity, assignment)));
    return items;
  });

  /** Delivered benefits of the signed-in user, latest delivery first. */
  readonly deliveredItems = computed(() => this.store.deliveredAssignments()
    .filter(assignment => assignment.employeeId === this.employeeId()));

  /**
   * Opens the read-only detail of a benefit.
   * @param assignment Assignment to show.
   * @author Salym
   */
  openDetail(assignment: BenefitAssignment): void {
    this.dialog.open(MyBenefitDetailDialog, { data: { assignment }, width: '480px', maxWidth: '95vw' });
  }

  /**
   * Builds a balance item and computes its available percentage.
   * @param key Unique key of the item.
   * @param name Name of the benefit, or null for vacations.
   * @param unit Unit of the balance.
   * @param available Quantity still available.
   * @param total Total quantity granted.
   * @param assignment Assignment behind the item, or null for vacations.
   * @author Salym
   */
  private toItem(key: string, name: string | null, unit: BenefitUnit, available: number, total: number,
                 assignment: BenefitAssignment | null): BalanceItem {
    const percentage = total > 0 ? Math.min(100, Math.max(0, available / total * 100)) : 0;
    return { key, name, unit, available, total, percentage, assignment };
  }
}
