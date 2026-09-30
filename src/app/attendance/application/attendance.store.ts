import { computed, Injectable, Signal, signal } from '@angular/core';
import { retry } from 'rxjs';
import { AttendanceApi } from '../infrastructure/attendance-api';
import { AttendanceRecord } from '../domain/model/attendance-record.entity';
import { AttendanceRecordAssembler } from '../infrastructure/attendance-record-assembler';

@Injectable({ providedIn: 'root' })
export class AttendanceStore {
  private readonly recordsSignal = signal<AttendanceRecord[]>([]);
  
  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly records = this.recordsSignal.asReadonly();

  readonly incompleteRecords = computed(() => 
    this.recordsSignal().filter(record => record.isIncomplete())
  );

  readonly statusSummary = computed(() => {
    const records = this.recordsSignal();
    return {
      onTime: records.filter(r => r.status === 'ON_TIME').length,
      late: records.filter(r => r.status === 'LATE').length,
      absent: records.filter(r => r.status === 'ABSENT').length
    };
  });

  constructor(private attendanceApi: AttendanceApi) {}

  getRecordById(id: string): Signal<AttendanceRecord | undefined> {
    return computed(() => id ? this.recordsSignal().find(record => record.id === id) : undefined);
  }

  loadRecords(employeeId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.attendanceApi.getRecordsByEmployeeId(employeeId).pipe(retry(2)).subscribe({
      next: responses => {
        this.recordsSignal.set(AttendanceRecordAssembler.toEntityArray(responses));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to load attendance records'));
        this.loadingSignal.set(false);
      }
    });
  }

  markEntry(employeeId: string, time: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.attendanceApi.markEntry(employeeId, time).pipe(retry(2)).subscribe({
      next: createdRecord => {
        const newEntity = AttendanceRecordAssembler.toEntity(createdRecord);
        this.recordsSignal.update(records => [...records, newEntity]);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to mark entry'));
        this.loadingSignal.set(false);
      }
    });
  }

  markExit(id: string, employeeId: string, time: string, scheduleStartTime: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.attendanceApi.markExit(id, employeeId, time, scheduleStartTime).pipe(retry(2)).subscribe({
      next: updatedRecord => {
        const updatedEntity = AttendanceRecordAssembler.toEntity(updatedRecord);
        this.recordsSignal.update(records =>
          records.map(current => current.id === updatedEntity.id ? updatedEntity : current)
        );
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to mark exit'));
        this.loadingSignal.set(false);
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}