import {DestroyRef, computed, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin, retry} from 'rxjs';
import {AttendanceApi} from '../infrastructure/attendance-api';
import {AttendanceArea} from '../domain/model/attendance-area.entity';
import {AttendanceEmployee} from '../domain/model/attendance-employee.entity';
import {AttendanceRecord, AttendanceStatus} from '../domain/model/attendance-record.entity';
import {WorkSchedule} from '../domain/model/work-schedule.entity';
import {Punch} from '../domain/model/punch.entity';
import {WorkspaceAcl} from '../infrastructure/workspace-acl';

export interface AttendanceRecordRow {
  record: AttendanceRecord;
  employeeName: string;
  areaId: number;
  areaName: string;
  positionId: number;
}

@Injectable({providedIn: 'root'})
export class AttendanceStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(AttendanceApi);
  private readonly workspaceAcl = inject(WorkspaceAcl);

  private readonly recordsSignal = signal<AttendanceRecord[]>([]);
  private readonly schedulesSignal = signal<WorkSchedule[]>([]);
  private readonly punchesSignal = signal<Punch[]>([]);
  private readonly employeesSignal = signal<AttendanceEmployee[]>([]);
  private readonly areasSignal = signal<AttendanceArea[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly records = this.recordsSignal.asReadonly();
  readonly schedules = this.schedulesSignal.asReadonly();
  readonly punches = this.punchesSignal.asReadonly();
  readonly employees = this.employeesSignal.asReadonly();
  readonly areas = this.areasSignal.asReadonly();

  readonly rows = computed<AttendanceRecordRow[]>(() => {
    const employees = new Map(this.employees().map(employee => [employee.id, employee]));
    const areas = new Map(this.areas().map(area => [area.id, area]));
    return this.records().map(record => {
      const employee = employees.get(record.employeeId);
      return {
        record,
        employeeName: employee?.fullName ?? `Employee #${record.employeeId}`,
        areaId: employee?.areaId ?? 0,
        areaName: employee ? (areas.get(employee.areaId)?.name ?? '-') : '-',
        positionId: employee?.positionId ?? 0
      };
    });
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({
      records: this.api.getAttendanceRecords(),
      schedules: this.api.getWorkSchedules(),
      punches: this.api.getPunches(),
      employees: this.workspaceAcl.getEmployees(),
      areas: this.workspaceAcl.getAreas()
    }).pipe(
      retry(2),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({records, schedules, punches, employees, areas}) => {
        this.recordsSignal.set([...records].sort((a, b) => b.workDate.localeCompare(a.workDate) || b.id - a.id));
        this.schedulesSignal.set(schedules);
        this.punchesSignal.set(punches);
        this.employeesSignal.set(employees);
        this.areasSignal.set(areas);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.errorSignal.set('attendance.errors.load');
        this.loadingSignal.set(false);
      }
    });
  }

  getEmployee(employeeId: number): AttendanceEmployee | undefined {
    return this.employees().find(employee => employee.id === employeeId);
  }

  getScheduleForEmployee(employeeId: number): WorkSchedule | undefined {
    const employee = this.getEmployee(employeeId);
    return employee ? this.schedules().find(schedule => schedule.positionId === employee.positionId) : undefined;
  }

  getRecord(id: number): AttendanceRecord | undefined {
    return this.records().find(record => record.id === id);
  }

  updateRecord(record: AttendanceRecord): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateAttendanceRecord(record).pipe(
      retry(2),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        this.recordsSignal.update(records => records.map(current => current.id === updated.id ? updated : current));
        this.loadingSignal.set(false);
      },
      error: () => {
        this.errorSignal.set('attendance.errors.update');
        this.loadingSignal.set(false);
      }
    });
  }

  justify(record: AttendanceRecord, reason: string, documentName: string | null): void {
    const updated = new AttendanceRecord({
      id: record.id,
      employeeId: record.employeeId,
      workDate: record.workDate,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      effectiveHours: record.effectiveHours,
      overtimeHours: record.overtimeHours,
      status: 'JUSTIFIED',
      justificationReason: reason,
      justificationDocumentName: documentName
    });
    this.updateRecord(updated);
  }

  deleteRecord(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.deleteAttendanceRecord(id).pipe(
      retry(2),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.recordsSignal.update(records => records.filter(record => record.id !== id));
        this.loadingSignal.set(false);
      },
      error: () => {
        this.errorSignal.set('attendance.errors.delete');
        this.loadingSignal.set(false);
      }
    });
  }

  clearError(): void { this.errorSignal.set(null); }

  static hoursToLabel(hours: number | null): string {
    if (hours === null || Number.isNaN(hours)) return '—';
    const whole = Math.floor(hours);
    const minutes = Math.round((hours - whole) * 60);
    return `${whole} h${minutes ? ` ${minutes} min` : ''}`;
  }

  static percent(value: number): string { return `${value.toFixed(1)} %`; }

  static statusLabel(status: AttendanceStatus): string {
    return `attendance.status.${status}`;
  }
}
