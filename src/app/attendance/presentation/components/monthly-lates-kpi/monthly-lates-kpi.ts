import {Component, computed, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';

/**
 * "Monthly lates" indicator of the HR dashboard (WA-02), registered in DASHBOARD_WIDGETS for the 'hr' dashboard in the 'kpi' slot.
 * Shows the late attendance records of the current month (or of the latest month with records) and their share of all records.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-monthly-lates-kpi',
  imports: [TranslatePipe],
  templateUrl: './monthly-lates-kpi.html',
  styleUrl: './monthly-lates-kpi.css',
})
export class MonthlyLatesKpi {
  private readonly store = inject(AttendanceStore);

  /** Current month as 'YYYY-MM' in local time. */
  private readonly currentMonth = MonthlyLatesKpi.localMonth(new Date());

  /** Month being reported: the current one, or the latest month with records when the current one has none. */
  readonly month = computed(() => {
    const records = this.store.records();
    if (records.some(record => record.workDate.startsWith(this.currentMonth))) return this.currentMonth;
    const latest = records.reduce((max, record) => record.workDate > max ? record.workDate : max, '');
    return latest ? latest.substring(0, 7) : this.currentMonth;
  });

  /** Whether the reported month is the current month. */
  readonly isCurrentMonth = computed(() => this.month() === this.currentMonth);

  /** Reported month formatted as 'MM/YYYY'. */
  readonly monthLabel = computed(() => {
    const [year, month] = this.month().split('-');
    return `${month}/${year}`;
  });

  /** Attendance records of the reported month. */
  private readonly monthRecords = computed(() => this.store.records().filter(record => record.workDate.startsWith(this.month())));

  /** Number of LATE records in the reported month. */
  readonly lateCount = computed(() => this.monthRecords().filter(record => record.status === 'LATE').length);

  /** Share of LATE records over all records of the reported month, with one decimal. */
  readonly latePercent = computed(() => {
    const total = this.monthRecords().length;
    return (total ? (this.lateCount() / total) * 100 : 0).toFixed(1);
  });

  /**
   * Formats a date as a local 'YYYY-MM' month key.
   *
   * @param date - the date to format
   * @returns the month key
   * @author Oscar Lizandro Vasquez Llave
   */
  private static localMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
