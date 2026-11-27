import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {AttendanceStore} from '../../../application/attendance.store';

/**
 * Presents attendance summary metrics grouped by area.
 *
 * @remarks Calculates punctuality and attendance counts for the selected monthly period.
 * @author Dario Avila de la cruz
 */
@Component({
  selector: 'app-attendance-summary',
  imports: [MatButton, MatIcon, TranslatePipe, RouterLink],
  templateUrl: './attendance-summary.html',
  styleUrl: './attendance-summary.css'
})
export class AttendanceSummary {
  readonly store = inject(AttendanceStore);
  private readonly translate = inject(TranslateService);
  readonly period = signal(AttendanceSummary.currentMonth());
  readonly compare = signal(AttendanceSummary.previousMonth());

  readonly areas = computed(() => this.store.areas().map(area => {
    const rows = this.store.rows().filter(row => row.areaId === area.id && row.record.workDate.startsWith(this.period()));
    const onTime = rows.filter(row => row.record.status === 'ON_TIME').length;
    const late = rows.filter(row => row.record.status === 'LATE').length;
    const absent = rows.filter(row => row.record.status === 'ABSENT').length;
    const denominator = onTime + late + absent;
    return {
      area,
      onTime,
      late,
      absent,
      total: rows.length,
      punctuality: denominator ? Math.round(onTime / denominator * 100) : 100
    };
  }));

/**
 * Downloads the attendance summary of the selected month, one row per area, as a UTF-8 CSV file.
 *
 * @author Dario Avila de la cruz
 */
  exportSummary(): void {
    const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
    const header = [
      this.translate.instant('attendance.area'),
      capitalize(this.translate.instant('attendance.summary.records')),
      this.translate.instant('attendance.status.ON_TIME'),
      this.translate.instant('attendance.status.LATE'),
      this.translate.instant('attendance.status.ABSENT'),
      `${capitalize(this.translate.instant('attendance.summary.punctuality'))} (%)`
    ];
    const rows = this.areas().map(item => [item.area.name, item.total, item.onTime, item.late, item.absent, item.punctuality]);
    const csv = [header, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-summary_${this.period()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

/**
 * Returns the current month in ISO year-month format.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

/**
 * Returns the previous month in ISO year-month format.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static previousMonth(): string {
    const now = new Date();
    return `${new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear()}-${String(new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth() + 1).padStart(2, '0')}`;
  }
}
