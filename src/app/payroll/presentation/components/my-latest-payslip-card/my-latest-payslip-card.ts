import {Component, computed, inject, input} from '@angular/core';
import {MatAnchor} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {PayrollStore} from '../../../application/payroll.store';

/**
 * "My latest payslip" card of the collaborator home (WA-10), registered in DASHBOARD_WIDGETS
 * for the 'employee' dashboard in the 'column-3' slot. Shows the latest published payslip of the
 * employee with its payment status and a link to download the PDF.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-my-latest-payslip-card',
  imports: [MatAnchor, MatIcon, TranslatePipe, LocalDatePipe],
  templateUrl: './my-latest-payslip-card.html',
  styleUrl: './my-latest-payslip-card.css',
})
export class MyLatestPayslipCard {
  private readonly store = inject(PayrollStore);
  private readonly translate = inject(TranslateService);

  /** Identifier of the employee whose payslip is shown. */
  readonly employeeId = input.required<number>();

  /** Latest published payslip of the employee, ordered by payroll period and then issue date. */
  readonly payslip = computed(() => {
    const periodKey = (payrollPeriodId: number) => {
      const period = this.store.getPeriodById(payrollPeriodId);
      return period ? period.periodYear * 100 + period.periodMonth : 0;
    };
    return [...this.store.visiblePayslipsForEmployee(this.employeeId())]
      .sort((a, b) => periodKey(b.payrollPeriodId) - periodKey(a.payrollPeriodId) || b.issueDate.localeCompare(a.issueDate))[0];
  });

  /** Month and year of the payslip period in the current language (e.g. "Agosto 2026"). */
  readonly periodName = computed(() => {
    const payslip = this.payslip();
    const period = payslip ? this.store.getPeriodById(payslip.payrollPeriodId) : undefined;
    if (!period) return '—';
    const locale = this.translate.currentLang() === 'en' ? 'en-US' : 'es-PE';
    const name = new Intl.DateTimeFormat(locale, {month: 'long'}).format(new Date(period.periodYear, period.periodMonth - 1, 1));
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${period.periodYear}`;
  });

  /** CSS class of the payment status pill. */
  readonly statusClass = computed(() => {
    switch (this.payslip()?.payment.status) {
      case 'PAID': return 'pill-active';
      case 'OBSERVED': return 'pill-error';
      default: return 'pill-suspended';
    }
  });
}
