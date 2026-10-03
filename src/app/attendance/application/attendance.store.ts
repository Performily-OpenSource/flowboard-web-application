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

/**
 * Represents an attendance record enriched with employee and area information for presentation.
 *
 * @remarks Combines Attendance domain data with Workspace data so attendance views can display employee and area context.
 * @author Dario Avila de la cruz
 */
export interface AttendanceRecordRow {
  record: AttendanceRecord;
  employeeName: string;
  areaId: number;
  areaName: string;
  positionId: number;
}

/**
 * Coordinates attendance state and operations for the application layer.
 *
 * @remarks Loads attendance records, schedules, punches and Workspace context, and exposes operations used by attendance views.
 * @author Dario Avila de la cruz
 */
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

/**
 * Performs the constructor operation.
 *
 * @author Dario Avila de la cruz
 */
  constructor() {
    this.load();
  }

/**
 * Loads the required data for the bounded context into the application store.
 *
 * @author Dario Avila de la cruz
 */
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

/**
 * Finds an employee by identifier.
 *
 * @param employeeId the employee identifier.
 * @returns The matching employee, or `undefined` when no employee is found.
 * @author Dario Avila de la cruz
 */
  getEmployee(employeeId: number): AttendanceEmployee | undefined {
    return this.employees().find(employee => employee.id === employeeId);
  }

/**
 * Finds the work schedule associated with an employee position.
 *
 * @param employeeId the employee identifier.
 * @returns The matching work schedule, or `undefined` when none is available.
 * @author Dario Avila de la cruz
 */
  getScheduleForEmployee(employeeId: number): WorkSchedule | undefined {
    const employee = this.getEmployee(employeeId);
    return employee ? this.schedules().find(schedule => schedule.positionId === employee.positionId) : undefined;
  }

/**
 * Finds an attendance record by identifier.
 *
 * @param id the identifier to look up or delete.
 * @returns The matching attendance record, or `undefined` when no record is found.
 * @author Dario Avila de la cruz
 */
  getRecord(id: number): AttendanceRecord | undefined {
    return this.records().find(record => record.id === id);
  }

/**
 * Updates an attendance record through the attendance API and refreshes local state.
 *
 * @param record the attendance record to update or justify.
 * @author Dario Avila de la cruz
 */
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

/**
 * Creates a justified version of an attendance record and persists it.
 *
 * @param record the attendance record to update or justify.
 * @param reason the justification reason.
 * @param documentName the optional justification document name.
 * @author Dario Avila de la cruz
 */
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

/**
 * Deletes an attendance record and removes it from local state.
 *
 * @param id the identifier to look up or delete.
 * @author Dario Avila de la cruz
 */
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

/**
 * Clears the current attendance store error.
 *
 * @author Dario Avila de la cruz
 */
  clearError(): void { this.errorSignal.set(null); }

/**
 * Formats a decimal hour value as a human-readable hour label.
 *
 * @param hours the hour value to format.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static hoursToLabel(hours: number | null): string {
    if (hours === null || Number.isNaN(hours)) return '—';
    const whole = Math.floor(hours);
    const minutes = Math.round((hours - whole) * 60);
    return `${whole} h${minutes ? ` ${minutes} min` : ''}`;
  }

/**
 * Formats a numeric value as a percentage string with one decimal place.
 *
 * @param value the value used by the operation.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static percent(value: number): string { return `${value.toFixed(1)} %`; }

/**
 * Returns the display value associated with an attendance status.
 *
 * @param status the attendance status to format or evaluate.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static statusLabel(status: AttendanceStatus): string {
    return `attendance.status.${status}`;
  }
}
