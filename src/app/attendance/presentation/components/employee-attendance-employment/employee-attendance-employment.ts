import {Component, computed, inject, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';

@Component({
  selector: 'app-employee-attendance-employment',
  imports: [TranslatePipe],
  template: `<div class="kv-row"><dt>{{ 'attendance.employee.weekly-schedule' | translate }}</dt><dd>{{ weeklyHours() }} {{ 'attendance.employee.hours' | translate }}</dd></div>`,
  styles: [':host { display: contents; }']
})
export class EmployeeAttendanceEmployment {
  readonly employeeId = input.required<number>();
  private readonly store = inject(AttendanceStore);

  readonly weeklyHours = computed(() => {
    const schedule = this.store.getScheduleForEmployee(this.employeeId());
    return schedule ? schedule.expectedHours() * schedule.workingDays.length : 0;
  });
}
