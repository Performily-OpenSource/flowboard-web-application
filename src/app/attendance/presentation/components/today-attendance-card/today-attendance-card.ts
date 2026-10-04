import {Component, computed, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';
import {AttendanceStatus} from '../../../domain/model/attendance-record.entity';

/**
 * One status row of the daily attendance breakdown.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface TodayAttendanceItem {
  status: AttendanceStatus;
  labelKey: string;
  count: number;
  percent: number;
  colorClass: string;
}

/**
 * "Today's attendance" card of the HR dashboard (WA-02), registered in DASHBOARD_WIDGETS for the 'hr' dashboard in the 'column-2' slot.
 * Breaks down the records of today (or of the latest day with records) into on time, late, absent and justified with progress bars.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-today-attendance-card',
  imports: [TranslatePipe],
  templateUrl: './today-attendance-card.html',
  styleUrl: './today-attendance-card.css',
})
export class TodayAttendanceCard {
  private readonly store = inject(AttendanceStore);

  /** Today as a local 'YYYY-MM-DD' date. */
  private readonly today = TodayAttendanceCard.localDate(new Date());

  /** Day being reported: today, or the latest work date with records when today has none. */
  readonly day = computed(() => {
    const records = this.store.records();
    if (records.some(record => record.workDate === this.today)) return this.today;
    return records.reduce((max, record) => record.workDate > max ? record.workDate : max, '');
  });

  /** Whether the reported day is today. */
  readonly isToday = computed(() => this.day() === this.today);

  /** Reported day formatted as 'dd/mm'. */
  readonly dayLabel = computed(() => {
    const [, month, day] = this.day().split('-');
    return `${day}/${month}`;
  });

  /** Attendance records of the reported day. */
  private readonly dayRecords = computed(() => this.store.records().filter(record => record.workDate === this.day()));

  /** Whether there is any record to show. */
  readonly hasData = computed(() => this.dayRecords().length > 0);

  /** Rows with count and bar percentage for each displayed status. */
  readonly items = computed<TodayAttendanceItem[]>(() => {
    const records = this.dayRecords();
    const total = records.length;
    const rows: Array<[AttendanceStatus, string, string]> = [
      ['ON_TIME', 'attendance-dashboard.on-time', 'fill-on-time'],
      ['LATE', 'attendance-dashboard.lates', 'fill-late'],
      ['ABSENT', 'attendance-dashboard.absences', 'fill-absent'],
      ['JUSTIFIED', 'attendance-dashboard.justified', 'fill-justified']
    ];
    return rows.map(([status, labelKey, colorClass]) => {
      const count = records.filter(record => record.status === status).length;
      return {status, labelKey, count, percent: total ? (count / total) * 100 : 0, colorClass};
    });
  });

  /**
   * Formats a date as a local 'YYYY-MM-DD' string.
   *
   * @param date - the date to format
   * @returns the formatted date
   * @author Oscar Lizandro Vasquez Llave
   */
  private static localDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
