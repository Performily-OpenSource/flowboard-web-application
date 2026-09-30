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
import {WorkspaceStore} from '../../../../workspace/application/workspace.store';

@Component({
  selector: 'app-attendance-records',
  imports: [DecimalPipe, SlicePipe, MatButton, MatIcon, MatProgressBar, MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, TranslatePipe, RouterLink],
  templateUrl: './attendance-records.html',
  styleUrl: './attendance-records.css'
})
export class AttendanceRecords {
  readonly store = inject(AttendanceStore);
  readonly workspace = inject(WorkspaceStore);
  private readonly dialog = inject(MatDialog);
  readonly columns = ['employee', 'date', 'checkIn', 'checkOut', 'workedHours', 'status', 'actions'];
  readonly fromDate = signal('2026-09-01');
  readonly toDate = signal('2026-09-09');
  readonly areaFilter = signal<number | null>(null);
  readonly statusFilter = signal<AttendanceStatus | null>(null);
  readonly page = signal(0);
  readonly pageSize = 8;
  readonly statuses = ATTENDANCE_STATUSES;

  readonly periodRecords = computed(() => this.store.rows()
    .filter(row => row.record.workDate >= this.fromDate() && row.record.workDate <= this.toDate())
    .filter(row => this.areaFilter() === null || row.areaName === this.workspace.getAreaById(this.areaFilter()!)()?.name)
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
  clearFilters() { this.fromDate.set('2026-09-01'); this.toDate.set('2026-09-09'); this.areaFilter.set(null); this.statusFilter.set(null); this.page.set(0); }

  openJustification(row: {record: AttendanceRecord; employeeName: string}) {
    this.dialog.open(AttendanceJustificationDialog, {data: row, width: '560px', maxWidth: '95vw'});
  }

  statusClass(status: AttendanceStatus): string { return status.toLowerCase(); }
  statusLabel(status: AttendanceStatus): string { return AttendanceStore.statusLabel(status); }
  hours(value: number | null): string { return AttendanceStore.hoursToLabel(value); }
  initials(name: string): string { return name.split(' ').slice(0,2).map(x => x[0]).join('').toUpperCase(); }
  employeeCount(): number { return new Set(this.periodRecords().map(r => r.record.employeeId)).size; }
}
