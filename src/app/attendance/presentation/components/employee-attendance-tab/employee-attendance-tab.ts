import {Component, computed, inject, input} from '@angular/core';
import {SlicePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';

@Component({
  selector: 'app-employee-attendance-tab',
  imports: [TranslatePipe, SlicePipe],
  templateUrl: './employee-attendance-tab.html',
  styleUrl: './employee-attendance-tab.css'
})
export class EmployeeAttendanceTab {
  readonly employeeId = input.required<number>();
  readonly store = inject(AttendanceStore);

  readonly rows = computed(() => this.store.rows()
    .filter(row => row.record.employeeId === this.employeeId())
    .sort((a, b) => b.record.workDate.localeCompare(a.record.workDate))
    .slice(0, 5));

  readonly summary = computed(() => {
    const rows = this.store.rows().filter(row => row.record.employeeId === this.employeeId());
    return {
      workedDays: rows.filter(row => row.record.effectiveHours !== null).length,
      late: rows.filter(row => row.record.status === 'LATE').length,
      absent: rows.filter(row => row.record.status === 'ABSENT').length,
      overtime: rows.reduce((sum, row) => sum + (row.record.overtimeHours ?? 0), 0)
    };
  });

  hours(value: number | null): string { return AttendanceStore.hoursToLabel(value); }
}
