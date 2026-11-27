import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';
import {AttendanceStatus} from '../../../domain/model/attendance-record.entity';

/** Work days shown by the chart. */
const DAYS_SHOWN = 10;

/** Statuses stacked in each bar, from bottom to top, with their legend key and color class. */
const SERIES: Array<{ status: AttendanceStatus; labelKey: string; colorClass: string }> = [
  { status: 'ON_TIME', labelKey: 'attendance-dashboard.on-time', colorClass: 'fill-on-time' },
  { status: 'LATE', labelKey: 'attendance-dashboard.lates', colorClass: 'fill-late' },
  { status: 'ABSENT', labelKey: 'attendance-dashboard.absences', colorClass: 'fill-absent' },
  { status: 'JUSTIFIED', labelKey: 'attendance-dashboard.justified', colorClass: 'fill-justified' }
];

/**
 * One segment of a bar: the records of one status on one day.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface AttendanceTrendSegment {
  status: AttendanceStatus;
  count: number;
  colorClass: string;
}

/**
 * One bar of the chart: the records of one work day.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface AttendanceTrendDay {
  date: string;
  /** Day formatted as 'dd/MM'. */
  label: string;
  total: number;
  /** Bar height as a percentage of the busiest day. */
  height: number;
  /** Segments from bottom to top; statuses without records are left out. */
  segments: AttendanceTrendSegment[];
}

/**
 * "Attendance trend" card of the HR dashboard (WA-02), registered in DASHBOARD_WIDGETS for the 'hr'
 * dashboard in the 'column-1' slot. Shows a stacked bar per work day for the latest days with records,
 * so the dashboard always has data to show even when there is nothing pending.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-attendance-trend-card',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './attendance-trend-card.html',
  styleUrl: './attendance-trend-card.css',
})
export class AttendanceTrendCard {
  private readonly store = inject(AttendanceStore);

  /** Series of the legend. */
  readonly series = SERIES;

  /** Bars of the latest work days with records, oldest first. */
  readonly days = computed<AttendanceTrendDay[]>(() => {
    const byDate = new Map<string, AttendanceStatus[]>();
    for (const record of this.store.records()) {
      const statuses = byDate.get(record.workDate) ?? [];
      statuses.push(record.status);
      byDate.set(record.workDate, statuses);
    }
    const dates = [...byDate.keys()].sort().slice(-DAYS_SHOWN);
    const max = Math.max(1, ...dates.map(date => byDate.get(date)!.length));
    return dates.map(date => {
      const statuses = byDate.get(date)!;
      const [, month, day] = date.split('-');
      return {
        date,
        label: `${day}/${month}`,
        total: statuses.length,
        height: (statuses.length / max) * 100,
        segments: SERIES
          .map(({ status, colorClass }) => ({ status, colorClass, count: statuses.filter(s => s === status).length }))
          .filter(segment => segment.count > 0)
      };
    });
  });

  /** Whether there is any day to show. */
  readonly hasData = computed(() => this.days().length > 0);

  /** Share of on-time records over every record shown, as an integer percentage. */
  readonly onTimePercent = computed(() => {
    const days = this.days();
    const total = days.reduce((sum, day) => sum + day.total, 0);
    const onTime = days.reduce((sum, day) =>
      sum + (day.segments.find(segment => segment.status === 'ON_TIME')?.count ?? 0), 0);
    return total ? Math.round((onTime / total) * 100) : 0;
  });

  /**
   * Builds the tooltip of a bar with the count of each status.
   *
   * @param day - Bar of one work day.
   * @returns Text such as "26/11 · ON_TIME 12 · LATE 1".
   * @author Oscar Lizandro Vasquez Llave
   */
  tooltip(day: AttendanceTrendDay): string {
    return [day.label, ...day.segments.map(segment => `${segment.status} ${segment.count}`)].join(' · ');
  }
}
