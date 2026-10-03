import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {AttendanceStore} from '../../../application/attendance.store';

/**
 * Presents aggregated effective hours and overtime by employee.
 *
 * @remarks Calculates monthly expected hours and variations and provides area filtering and ordering for the hours view.
 * @author Dario Avila de la cruz
 */
@Component({selector: 'app-attendance-hours', imports: [MatButton, MatIcon, TranslatePipe, RouterLink], templateUrl: './attendance-hours.html', styleUrl: './attendance-hours.css'})
export class AttendanceHours {
  readonly store = inject(AttendanceStore);
  readonly period = signal(AttendanceHours.currentMonth());
  readonly areaFilter = signal<number | null>(null);
  readonly order = signal('overtime');

  readonly rows = computed(() => this.store.employees()
    .map(employee => {
      const records = this.store.records().filter(record => record.employeeId === employee.id && record.workDate.startsWith(this.period()));
      const effective = records.reduce((sum, record) => sum + (record.effectiveHours ?? 0), 0);
      const overtime = records.reduce((sum, record) => sum + (record.overtimeHours ?? 0), 0);
      const expected = this.expectedHours(employee.id);
      const variation = expected ? overtime / expected * 100 : 0;
      return {employee, effective, overtime, expected, variation};
    })
    .filter(row => this.areaFilter() === null || row.employee.areaId === this.areaFilter())
    .sort((a, b) => this.order() === 'effective' ? b.effective - a.effective : b.overtime - a.overtime));

/**
 * Calculates the expected hours for an employee during the selected period.
 *
 * @param employeeId the employee identifier.
 * @returns The expected number of working hours for the requested period.
 * @author Dario Avila de la cruz
 */
  expectedHours(employeeId: number): number {
    const schedule = this.store.getScheduleForEmployee(employeeId);
    if (!schedule) return 0;
    const [year, month] = this.period().split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const today = new Date();
    const effectiveEnd = Math.min(end.getTime(), today.getTime());
    let days = 0;
    for (let cursor = new Date(start); cursor.getTime() <= effectiveEnd; cursor.setDate(cursor.getDate() + 1)) {
      const iso = AttendanceHours.toIsoDate(cursor);
      if (schedule.isWorkingDay(iso)) days++;
    }
    return days * schedule.expectedHours();
  }

/**
 * Classifies an hours variation into a presentation level.
 *
 * @param variation the calculated hours variation.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  level(variation: number): string { return variation >= 8 ? 'high' : variation > 0 ? 'normal' : 'low'; }
/**
 * Formats an hour value for display.
 *
 * @param value the value used by the operation.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  hours(value: number): string { return AttendanceStore.hoursToLabel(value); }

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
 * Converts a Date value into an ISO date string.
 *
 * @param date the date to evaluate.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  private static toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
