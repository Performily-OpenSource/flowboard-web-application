import {Component, computed, inject, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';
import {AttendanceStatus} from '../../../domain/model/attendance-record.entity';

/**
 * One weekday tile of the weekly attendance card.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface WeekDayTile {
  date: string;
  letterKey: string;
  status: AttendanceStatus | null;
  statusKey: string;
  colorClass: string;
}

/**
 * "My attendance this week" card of the collaborator home (WA-10), registered in DASHBOARD_WIDGETS for the 'employee' dashboard in the 'column-3' slot.
 * Shows a Monday-to-Friday tile per day with the attendance status of the current week (or of the latest week with records) and the worked hours.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-my-week-attendance-card',
  imports: [TranslatePipe],
  templateUrl: './my-week-attendance-card.html',
  styleUrl: './my-week-attendance-card.css',
})
export class MyWeekAttendanceCard {
  private readonly store = inject(AttendanceStore);

  /** Identifier of the employee whose week is shown. */
  readonly employeeId = input.required<number>();

  /** Today as a local 'YYYY-MM-DD' date. */
  private readonly today = MyWeekAttendanceCard.localDate(new Date());

  /** Attendance records of the employee. */
  private readonly myRecords = computed(() => this.store.records().filter(record => record.employeeId === this.employeeId()));

  /** Monday of the current week as 'YYYY-MM-DD'. */
  private readonly currentMonday = MyWeekAttendanceCard.mondayOf(this.today);

  /** Monday of the reported week: the current one, or the week of the employee's latest record when the current week has none. */
  readonly monday = computed(() => {
    const records = this.myRecords();
    const currentDays = MyWeekAttendanceCard.weekDays(this.currentMonday);
    if (records.some(record => currentDays.includes(record.workDate))) return this.currentMonday;
    const latest = records.reduce((max, record) => record.workDate > max ? record.workDate : max, '');
    return latest ? MyWeekAttendanceCard.mondayOf(latest) : this.currentMonday;
  });

  /** Whether the reported week is the current week. */
  readonly isCurrentWeek = computed(() => this.monday() === this.currentMonday);

  /** Monday of the reported week formatted as 'dd/mm'. */
  readonly weekLabel = computed(() => {
    const [, month, day] = this.monday().split('-');
    return `${day}/${month}`;
  });

  /** Records of the employee within the reported week. */
  private readonly weekRecords = computed(() => {
    const days = MyWeekAttendanceCard.weekDays(this.monday());
    return this.myRecords().filter(record => days.includes(record.workDate));
  });

  /** Monday-to-Friday tiles with the status of each day. */
  readonly tiles = computed<WeekDayTile[]>(() => {
    const letters = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const byDate = new Map(this.weekRecords().map(record => [record.workDate, record]));
    return MyWeekAttendanceCard.weekDays(this.monday()).map((date, index) => {
      const status = byDate.get(date)?.status ?? null;
      const statusKey = status
        ? `attendance-dashboard.tile-status.${status}`
        : date === this.today ? 'attendance-dashboard.today' : 'attendance-dashboard.no-record';
      return {
        date,
        letterKey: `attendance-dashboard.weekday-letter.${letters[index]}`,
        status,
        statusKey,
        colorClass: status ? `tile-${status.toLowerCase().replace('_', '-')}` : 'tile-empty'
      };
    });
  });

  /** Effective hours worked in the reported week, formatted as 'X h Y min'. */
  readonly workedHours = computed(() => {
    const totalMinutes = Math.round(this.weekRecords().reduce((sum, record) => sum + (record.effectiveHours ?? 0), 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
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

  /**
   * Computes the Monday of the week that contains a date.
   *
   * @param date - the date as 'YYYY-MM-DD'
   * @returns the Monday as 'YYYY-MM-DD'
   * @author Oscar Lizandro Vasquez Llave
   */
  private static mondayOf(date: string): string {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() - ((value.getDay() + 6) % 7));
    return MyWeekAttendanceCard.localDate(value);
  }

  /**
   * Lists the Monday-to-Friday dates of a week.
   *
   * @param monday - the Monday of the week as 'YYYY-MM-DD'
   * @returns the five weekday dates as 'YYYY-MM-DD'
   * @author Oscar Lizandro Vasquez Llave
   */
  private static weekDays(monday: string): string[] {
    return Array.from({length: 5}, (_, offset) => {
      const value = new Date(`${monday}T00:00:00`);
      value.setDate(value.getDate() + offset);
      return MyWeekAttendanceCard.localDate(value);
    });
  }
}
