import {computed, Injectable, signal} from '@angular/core';
import {retry} from 'rxjs';
import {AttendanceApi} from '../infrastructure/attendance-api';
import {AttendanceRecord, AttendanceStatus} from '../domain/model/attendance-record.entity';
import {WorkSchedule} from '../domain/model/work-schedule.entity';
import {Punch} from '../domain/model/punch.entity';
import {WorkspaceStore} from '../../workspace/application/workspace.store';

export interface AttendanceRecordRow {
  record: AttendanceRecord;
  employeeName: string;
  areaName: string;
  positionId: number | null;
}

@Injectable({providedIn: 'root'})
export class AttendanceStore {
  private readonly recordsSignal = signal<AttendanceRecord[]>([]);
  private readonly schedulesSignal = signal<WorkSchedule[]>([]);
  private readonly punchesSignal = signal<Punch[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly records = this.recordsSignal.asReadonly();
  readonly schedules = this.schedulesSignal.asReadonly();
  readonly punches = this.punchesSignal.asReadonly();

  readonly rows = computed<AttendanceRecordRow[]>(() => this.records().map(record => {
    const employee = this.workspace.getEmployeeById(record.employeeId)();
    return {
      record,
      employeeName: employee?.fullName ?? `Employee #${record.employeeId}`,
      areaName: employee?.area?.name ?? '-',
      positionId: employee?.positionId ?? null
    };
  }));

  constructor(private readonly api: AttendanceApi, private readonly workspace: WorkspaceStore) {
    this.load();
  }

  load(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getAttendanceRecords().pipe(retry(2)).subscribe({
      next: records => {
        this.recordsSignal.set(records.sort((a, b) => b.workDate.localeCompare(a.workDate) || b.id - a.id));
        this.api.getWorkSchedules().subscribe({
          next: schedules => {
            this.schedulesSignal.set(schedules);
            this.api.getPunches().subscribe({next: punches => this.punchesSignal.set(punches), error: () => undefined});
            this.loadingSignal.set(false);
          },
          error: () => { this.loadingSignal.set(false); }
        });
      },
      error: error => {
        this.errorSignal.set(error?.message ?? 'No se pudo cargar la asistencia.');
        this.loadingSignal.set(false);
      }
    });
  }

  getScheduleForEmployee(employeeId: number): WorkSchedule | undefined {
    const employee = this.workspace.getEmployeeById(employeeId)();
    return employee ? this.schedules().find(schedule => schedule.positionId === employee.positionId) : undefined;
  }

  getRecord(id: number): AttendanceRecord | undefined {
    return this.records().find(record => record.id === id);
  }

  updateRecord(record: AttendanceRecord): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateAttendanceRecord(record).subscribe({
      next: updated => {
        this.recordsSignal.update(records => records.map(current => current.id === updated.id ? updated : current));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(error?.message ?? 'No se pudo actualizar el registro.');
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
      workedHours: record.workedHours,
      overtimeHours: record.overtimeHours,
      status: 'JUSTIFIED',
      justificationReason: reason,
      justificationDocumentName: documentName
    });
    this.updateRecord(updated);
  }

  deleteRecord(id: number): void {
    this.api.deleteAttendanceRecord(id).subscribe({
      next: () => this.recordsSignal.update(records => records.filter(record => record.id !== id)),
      error: error => this.errorSignal.set(error?.message ?? 'No se pudo eliminar el registro.')
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
    return ({ON_TIME: 'Puntual', LATE: 'Tardanza', ABSENT: 'Inasistencia', JUSTIFIED: 'Justificada', INCOMPLETE: 'Incompleto'})[status];
  }
}