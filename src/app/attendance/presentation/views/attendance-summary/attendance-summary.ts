import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
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
