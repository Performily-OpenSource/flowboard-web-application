import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {AttendanceStore} from '../../../application/attendance.store';

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

  level(variation: number): string { return variation >= 8 ? 'high' : variation > 0 ? 'normal' : 'low'; }
  hours(value: number): string { return AttendanceStore.hoursToLabel(value); }

  static currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private static toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
