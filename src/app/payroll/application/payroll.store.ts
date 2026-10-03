import {computed, DestroyRef, Injectable, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin, Observable} from 'rxjs';
import {retry} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {PayrollApi} from '../infrastructure/payroll-api';
import {WorkspaceAcl} from '../infrastructure/workspace-acl';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {FileReference, Money, Payslip, PaymentDetails} from '../domain/model/payslip.entity';
import {PayrollArea} from '../domain/model/payroll-area.model';
import {PayrollEmployee} from '../domain/model/payroll-employee.model';
import {CurrentEmployeeStore} from '../../shared/application/current-employee.store';

@Injectable({providedIn: 'root'})
/**
 * Centralizes payroll state and coordinates operations between the user interface and infrastructure services.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly periodsSignal = signal<PayrollPeriod[]>([]);
  private readonly payslipsSignal = signal<Payslip[]>([]);
  private readonly employeesSignal = signal<PayrollEmployee[]>([]);
  private readonly areasSignal = signal<PayrollArea[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly operationErrorSignal = signal<string | null>(null);
  private readonly operationVersionSignal = signal(0);

  readonly periods = this.periodsSignal.asReadonly();
  readonly payslips = this.payslipsSignal.asReadonly();
  readonly employees = this.employeesSignal.asReadonly();
  readonly areas = this.areasSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly operationError = this.operationErrorSignal.asReadonly();
  readonly operationVersion = this.operationVersionSignal.asReadonly();
  readonly currentEmployeeId = computed(() => this.currentEmployee.employeeId());
  readonly latestPeriod = computed(() => this.periodsSignal()[0]);

  constructor(
    private readonly payrollApi: PayrollApi,
    private readonly workspaceAcl: WorkspaceAcl,
    private readonly currentEmployee: CurrentEmployeeStore
  ) {
    this.load();
  }

/**
 * Finds a period by its identifier.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  getPeriodById(id: number): PayrollPeriod | undefined { return this.periodsSignal().find(period => period.id === id); }
/**
 * Finds a payslip by its identifier.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  getPayslipById(id: number): Payslip | undefined { return this.payslipsSignal().find(payslip => payslip.id === id); }
/**
 * Finds an employee by their identifier.
 * @param id Parameter used by the operation.
 * @author Diana Li
 */
  getEmployeeById(id: number): PayrollEmployee | undefined { return this.employeesSignal().find(employee => employee.id === id); }
/**
 * Retrieves the area associated with an employee.
 * @param employeeId Parameter used by the operation.
 * @author Diana Li
 */
  getAreaByEmployeeId(employeeId: number): PayrollArea | undefined {
    const employee = this.getEmployeeById(employeeId);
    return employee ? this.areasSignal().find(area => area.id === employee.areaId) : undefined;
  }

/**
 * Retrieves published payslips visible to an employee.
 * @param employeeId Parameter used by the operation.
 * @author Diana Li
 */
  visiblePayslipsForEmployee(employeeId: number): Payslip[] {
    return this.payslipsSignal().filter(payslip => payslip.isVisibleTo(employeeId)).sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }

/**
 * Checks whether a payslip already exists for an employee and period.
 * @param employeeId Parameter used by the operation.
 * @param payrollPeriodId Parameter used by the operation.
 * @param excludedId Parameter used by the operation.
 * @author Diana Li
 */
  existsForEmployeePeriod(employeeId: number, payrollPeriodId: number, excludedId: number | null = null): boolean {
    return this.payslipsSignal().some(payslip => payslip.employeeId === employeeId && payslip.payrollPeriodId === payrollPeriodId && payslip.id !== excludedId);
  }

/**
 * Creates a new payslip.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  createPayslip(payslip: Payslip): void {
    if (this.existsForEmployeePeriod(payslip.employeeId, payslip.payrollPeriodId)) {
      this.failOperation(this.translate.instant('payroll.errors.duplicate'));
      return;
    }
    this.persist(this.payrollApi.createPayslip(this.copyPayslip(payslip)), saved => {
      this.payslipsSignal.update(items => [...items, saved]);
    });
  }

/**
 * Creates multiple payslips.
 * @param payslips Parameter used by the operation.
 * @author Diana Li
 */
  createPayslips(payslips: Payslip[]): void {
    const duplicate = payslips.find(item => this.existsForEmployeePeriod(item.employeeId, item.payrollPeriodId));
    if (duplicate) {
      this.failOperation(this.translate.instant('payroll.errors.duplicate'));
      return;
    }
    this.persist(forkJoin(payslips.map(payslip => this.payrollApi.createPayslip(this.copyPayslip(payslip)))), saved => {
      this.payslipsSignal.update(items => [...items, ...saved]);
    });
  }

/**
 * Replaces the data of an existing payslip.
 * @param existing Parameter used by the operation.
 * @param replacement Parameter used by the operation.
 * @author Diana Li
 */
  replacePayslip(existing: Payslip, replacement: Payslip): void {
    const updated = this.copyPayslip(existing);
    updated.replaceFile(replacement.file, replacement.issueDate, replacement.netAmount);
    this.persist(this.payrollApi.updatePayslip(updated), saved => this.replaceInState(saved));
  }

/**
 * Publishes a payslip.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  publishPayslip(payslip: Payslip): void {
    const updated = this.copyPayslip(payslip);
    updated.publish();
    this.persist(this.payrollApi.updatePayslip(updated), saved => this.replaceInState(saved));
  }

/**
 * Marks the payslip as paid with the specified date.
 * @param payslip Parameter used by the operation.
 * @param paidOn Parameter used by the operation.
 * @author Diana Li
 */
  markAsPaid(payslip: Payslip, paidOn: string): void {
    const updated = this.copyPayslip(payslip);
    updated.markAsPaid(paidOn);
    this.persist(this.payrollApi.updatePayslip(updated), saved => this.replaceInState(saved));
  }

/**
 * Records an observation about the payslip payment.
 * @param payslip Parameter used by the operation.
 * @param reason Parameter used by the operation.
 * @author Diana Li
 */
  markAsObserved(payslip: Payslip, reason: string): void {
    const updated = this.copyPayslip(payslip);
    updated.markAsObserved(reason);
    this.persist(this.payrollApi.updatePayslip(updated), saved => this.replaceInState(saved));
  }

/**
 * Clears the error messages from the state.
 * @author Diana Li
 */
  clearError(): void { this.errorSignal.set(null); this.operationErrorSignal.set(null); }

/**
 * Executes the load operation of the component.
 * @author Diana Li
 */
  private load(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({
      periods: this.payrollApi.getPeriods().pipe(retry(2)),
      payslips: this.payrollApi.getPayslips().pipe(retry(2)),
      employees: this.workspaceAcl.getEmployees().pipe(retry(2)),
      areas: this.workspaceAcl.getAreas().pipe(retry(2))
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({periods, payslips, employees, areas}) => {
        this.periodsSignal.set([...periods].sort((a, b) => b.periodYear - a.periodYear || b.periodMonth - a.periodMonth));
        this.payslipsSignal.set(payslips);
        this.employeesSignal.set(employees);
        this.areasSignal.set(areas);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'payroll.errors.load'));
        this.loadingSignal.set(false);
      }
    });
  }

  private persist<T>(request: Observable<T>, onSuccess: (saved: T) => void): void {
    this.loadingSignal.set(true);
    this.operationErrorSignal.set(null);
    request.pipe(retry(2), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
/**
 * Executes the onSuccess operation of the component.
 * @param saved Parameter used by the operation.
 * @author Diana Li
 */
        onSuccess(saved);
        this.loadingSignal.set(false);
        this.operationVersionSignal.update(version => version + 1);
      },
      error: error => this.failOperation(this.formatError(error, 'payroll.errors.save'))
    });
  }

/**
 * Executes the failOperation operation of the component.
 * @param message Parameter used by the operation.
 * @author Diana Li
 */
  private failOperation(message: string): void {
    this.operationErrorSignal.set(message);
    this.loadingSignal.set(false);
    this.operationVersionSignal.update(version => version + 1);
  }

/**
 * Executes the replaceInState operation of the component.
 * @param saved Parameter used by the operation.
 * @author Diana Li
 */
  private replaceInState(saved: Payslip): void {
    this.payslipsSignal.update(items => items.map(item => item.id === saved.id ? saved : item));
  }

/**
 * Executes the copyPayslip operation of the component.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  private copyPayslip(payslip: Payslip): Payslip {
    return new Payslip({
      id: payslip.id,
      employeeId: payslip.employeeId,
      payrollPeriodId: payslip.payrollPeriodId,
      file: new FileReference({
        fileName: payslip.file.fileName,
        contentType: payslip.file.contentType,
        sizeInBytes: payslip.file.sizeInBytes,
        storageUrl: payslip.file.storageUrl
      }),
      issueDate: payslip.issueDate,
      netAmount: new Money(payslip.netAmount.amount, payslip.netAmount.currency),
      publicationStatus: payslip.publicationStatus,
      publishedAt: payslip.publishedAt,
      payment: payslip.payment.status === 'PAID'
        ? PaymentDetails.pending().paid(payslip.payment.paidOn ?? '')
        : payslip.payment.status === 'OBSERVED'
          ? PaymentDetails.pending().observed(payslip.payment.observationReason ?? '')
          : PaymentDetails.pending()
    });
  }

/**
 * Executes the formatError operation of the component.
 * @param error Parameter used by the operation.
 * @param fallbackKey Parameter used by the operation.
 * @author Diana Li
 */
  private formatError(error: unknown, fallbackKey: string): string {
    return error instanceof Error && error.message ? error.message : this.translate.instant(fallbackKey);
  }
}
