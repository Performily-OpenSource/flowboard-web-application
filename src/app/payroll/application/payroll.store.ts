import {computed, Injectable, signal} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {retry, tap} from 'rxjs/operators';
import {PayrollApi} from '../infrastructure/payroll-api';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {Payslip} from '../domain/model/payslip.entity';
import {WorkspaceStore} from '../../workspace/application/workspace.store';

/** Application state for Payroll. The authenticated employee is simulated until IAM is integrated. */
@Injectable({providedIn: 'root'})
export class PayrollStore {
  private readonly periodsSignal = signal<PayrollPeriod[]>([]);
  private readonly payslipsSignal = signal<Payslip[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly periods = this.periodsSignal.asReadonly();
  readonly payslips = this.payslipsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly employees = computed(() => this.workspaceStore.employees());
  readonly areas = computed(() => this.workspaceStore.areas());

  readonly currentEmployeeId = 2;

  constructor(private readonly payrollApi: PayrollApi, private readonly workspaceStore: WorkspaceStore) {
    this.load();
  }

  getPeriodById(id: number): PayrollPeriod | undefined {
    return this.periodsSignal().find(period => period.id === id);
  }

  getPayslipById(id: number): Payslip | undefined {
    return this.payslipsSignal().find(payslip => payslip.id === id);
  }

  getEmployeeById(id: number) {
    return this.employees().find(employee => employee.id === id);
  }

  getAreaByEmployeeId(employeeId: number) {
    const employee = this.getEmployeeById(employeeId);
    return employee ? this.areas().find(area => area.id === employee.areaId) : undefined;
  }

  visiblePayslipsForEmployee(employeeId: number): Payslip[] {
    return this.payslipsSignal()
      .filter(payslip => payslip.isVisibleTo(employeeId))
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }

  existsForEmployeePeriod(employeeId: number, payrollPeriodId: number, excludedId: number | null = null): boolean {
    return this.payslipsSignal().some(payslip =>
      payslip.employeeId === employeeId &&
      payslip.payrollPeriodId === payrollPeriodId &&
      payslip.id !== excludedId);
  }

  createPayslip(payslip: Payslip): Observable<Payslip> {
    if (this.existsForEmployeePeriod(payslip.employeeId, payslip.payrollPeriodId)) {
      return throwError(() => new Error('Ya existe una boleta para ese colaborador y periodo. Reemplaza la existente si necesitas cargar una nueva versión.'));
    }
    return this.persist(this.payrollApi.createPayslip(payslip));
  }

  replacePayslip(existing: Payslip, replacement: Payslip): Observable<Payslip> {
    existing.replaceFile(replacement.file, replacement.issueDate, replacement.netAmount);
    return this.persist(this.payrollApi.updatePayslip(existing));
  }

  publishPayslip(payslip: Payslip): Observable<Payslip> {
    payslip.publish();
    return this.persist(this.payrollApi.updatePayslip(payslip));
  }

  markAsPaid(payslip: Payslip, paidOn: string): Observable<Payslip> {
    payslip.markAsPaid(paidOn);
    return this.persist(this.payrollApi.updatePayslip(payslip));
  }

  markAsObserved(payslip: Payslip, reason: string): Observable<Payslip> {
    payslip.markAsObserved(reason);
    return this.persist(this.payrollApi.updatePayslip(payslip));
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private load(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.payrollApi.getPeriods().pipe(retry(2)).subscribe({
      next: periods => {
        this.periodsSignal.set(periods.sort((a, b) => b.year - a.year || b.month - a.month));
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'No se pudieron cargar los periodos de planilla.'));
        this.loadingSignal.set(false);
      }
    });

    this.payrollApi.getPayslips().pipe(retry(2)).subscribe({
      next: payslips => this.payslipsSignal.set(payslips),
      error: error => this.errorSignal.set(this.formatError(error, 'No se pudieron cargar las boletas.'))
    });
  }

  private persist(request: Observable<Payslip>): Observable<Payslip> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return request.pipe(
      retry(2),
      tap({
        next: saved => {
          this.payslipsSignal.update(items => {
            const exists = items.some(item => item.id === saved.id);
            return exists ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved];
          });
          this.loadingSignal.set(false);
        },
        error: error => {
          this.errorSignal.set(this.formatError(error, 'No se pudo actualizar la boleta.'));
          this.loadingSignal.set(false);
        }
      })
    );
  }

  private formatError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
