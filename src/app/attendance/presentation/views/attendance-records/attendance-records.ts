import {Component, computed, inject, signal} from '@angular/core';
import {DecimalPipe, SlicePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {AttendanceStore} from '../../../application/attendance.store';
import {AttendanceRecord, ATTENDANCE_STATUSES, AttendanceStatus} from '../../../domain/model/attendance-record.entity';
import {AttendanceJustificationDialog} from '../../components/attendance-justification-dialog/attendance-justification-dialog';

/**
 * Presents the attendance record list for authorized attendance users.
 *
 * @remarks Provides period, area and status filtering, pagination, attendance metrics and justification actions.
 * @author Dario Avila de la cruz
 */
@Component({
  selector: 'app-attendance-records',
  imports: [DecimalPipe, SlicePipe, MatButton, MatIcon, MatProgressBar, MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, TranslatePipe, RouterLink],
  templateUrl: './attendance-records.html',
  styleUrl: './attendance-records.css'
})
export class AttendanceRecords {
  readonly store = inject(AttendanceStore);
  private readonly dialog = inject(MatDialog);
  readonly columns = ['employee', 'date', 'checkIn', 'checkOut', 'workedHours', 'status', 'actions'];
  readonly fromDate = signal(AttendanceRecords.monthStart());
  readonly toDate = signal(AttendanceRecords.today());
  readonly areaFilter = signal<number | null>(null);
  readonly statusFilter = signal<AttendanceStatus | null>(null);
  readonly page = signal(0);
  readonly pageSize = 8;
  readonly statuses = ATTENDANCE_STATUSES;

  readonly periodRecords = computed(() => this.store.rows()
    .filter(row => row.record.workDate >= this.fromDate() && row.record.workDate <= this.toDate())
    .filter(row => this.areaFilter() === null || row.areaId === this.areaFilter())
    .filter(row => this.statusFilter() === null || row.record.status === this.statusFilter())
    .sort((a,b) => b.record.workDate.localeCompare(a.record.workDate) || a.employeeName.localeCompare(b.employeeName)));

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.periodRecords().length / this.pageSize)));
  readonly pages = computed(() => Array.from({length: this.pageCount()}, (_, i) => i));
  readonly pageRows = computed(() => this.periodRecords().slice(this.page()*this.pageSize, (this.page()+1)*this.pageSize));
  readonly rangeStart = computed(() => this.periodRecords().length ? this.page()*this.pageSize+1 : 0);
  readonly rangeEnd = computed(() => Math.min((this.page()+1)*this.pageSize, this.periodRecords().length));
  
  readonly punctuality = computed(() => {
    const relevant = this.periodRecords().filter(r => r.record.status === 'ON_TIME' || r.record.status === 'LATE');
    return relevant.length ? (relevant.filter(r => r.record.status === 'ON_TIME').length / relevant.length) * 100 : 0;
  });
  readonly latenessCount = computed(() => this.periodRecords().filter(r => r.record.status === 'LATE').length);
  readonly absenceCount = computed(() => this.periodRecords().filter(r => r.record.status === 'ABSENT').length);
  readonly justifiedCount = computed(() => this.periodRecords().filter(r => r.record.status === 'JUSTIFIED').length);
  readonly overtime = computed(() => this.periodRecords().reduce((sum, row) => sum + (row.record.overtimeHours ?? 0), 0));


  setFrom(value: string) { this.fromDate.set(value); this.page.set(0); }

  setTo(value: string) { this.toDate.set(value); this.page.set(0); }

  setArea(value: string) { this.areaFilter.set(value ? +value : null); this.page.set(0); }

  setStatus(value: string) { this.statusFilter.set((value || null) as AttendanceStatus | null); this.page.set(0); }
/**
 * Restores the default attendance period and clears all filters.
 *
 * @author Dario Avila de la cruz
 */
  clearFilters() { this.fromDate.set(AttendanceRecords.monthStart()); this.toDate.set(AttendanceRecords.today()); this.areaFilter.set(null); this.statusFilter.set(null); this.page.set(0); }

/**
 * Opens the justification dialog for an attendance row.
 *
 * @param row the attendance row to process.
 * @author Dario Avila de la cruz
 */
  openJustification(row: {record: AttendanceRecord; employeeName: string}) {
    this.dialog.open(AttendanceJustificationDialog, {data: row, width: '560px', maxWidth: '95vw'});
  }

/**
 * Returns the CSS class associated with an attendance status.
 *
 * @param status the attendance status to format or evaluate.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  statusClass(status: AttendanceStatus): string { return status.toLowerCase(); }
/**
 * Returns the display value associated with an attendance status.
 *
 * @param status the attendance status to format or evaluate.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  statusLabel(status: AttendanceStatus): string { return status; }
/**
 * Formats an hour value for display.
 *
 * @param value the value used by the operation.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  hours(value: number | null): string { return AttendanceStore.hoursToLabel(value); }
/**
 * Builds the initials used to represent the employee in the user interface.
 *
 * @param name the employee name used to build initials.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  initials(name: string): string { return name.split(' ').slice(0,2).map(x => x[0]).join('').toUpperCase(); }
/**
 * Returns the current date in ISO date format.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static today(): string {
    return AttendanceRecords.toIsoDate(new Date());
  }

/**
 * Returns the first day of the current month in ISO date format.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static monthStart(): string {
    const now = new Date();
    return AttendanceRecords.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
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

/**
 * Returns the number of distinct employees represented in the current period.
 *
 * @returns The value produced by the `employeeCount` operation.
 * @author Dario Avila de la cruz
 */
  employeeCount(): number { return new Set(this.periodRecords().map(r => r.record.employeeId)).size; }
}

