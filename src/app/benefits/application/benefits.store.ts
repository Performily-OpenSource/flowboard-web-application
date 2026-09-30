import {computed, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin, retry} from 'rxjs';
import {DateRange} from '../../shared/domain/model/date-range';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {BenefitsApi} from '../infrastructure/benefits-api';
import {BenefitTypeAssembler} from '../infrastructure/benefit-type-assembler';
import {BenefitAssignmentAssembler} from '../infrastructure/benefit-assignment-assembler';
import {VacationBalanceAssembler} from '../infrastructure/vacation-balance-assembler';
import {WorkspaceAcl} from '../infrastructure/workspace-acl';
import {CurrentEmployeeStore} from '../../shared/application/current-employee.store';

export interface AssignBenefitCommand {
  benefitTypeId: number;
  employeeId: number | null;
  areaId: number | null;
  validity: DateRange;
  quantity: number;
}

export interface AssignmentPlan {
  /** Employees that will receive the benefit. */
  employeeIds: number[];
  /** Employees that already have the same benefit in an overlapping period. */
  conflictingEmployeeIds: number[];
}

@Injectable({providedIn: 'root'})
export class BenefitsStore {
  private readonly directory = inject(WorkspaceAcl);
  private readonly currentEmployee = inject(CurrentEmployeeStore);
  private readonly typeAssembler = new BenefitTypeAssembler();
  private readonly assignmentAssembler = new BenefitAssignmentAssembler();
  private readonly balanceAssembler = new VacationBalanceAssembler();

  private readonly benefitTypesSignal = signal<BenefitType[]>([]);
  private readonly assignmentsSignal = signal<BenefitAssignment[]>([]);
  private readonly balancesSignal = signal<VacationBalance[]>([]);

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  readonly benefitTypes = computed(() =>
    [...this.benefitTypesSignal()].sort((a, b) => a.id - b.id));

  readonly activeBenefitTypes = computed(() => this.benefitTypes().filter(type => type.active));

  readonly assignments = computed(() => {
    const types = new Map(this.benefitTypesSignal().map(type => [type.id, type]));
    return this.assignmentsSignal()
      .map(assignment => {
        assignment.benefitType = types.get(assignment.benefitTypeId) ?? null;
        return assignment;
      })
      .sort((a, b) => b.validity.startDate.localeCompare(a.validity.startDate) || b.id - a.id);
  });

  readonly deliveredAssignments = computed(() =>
    this.assignments()
      .filter(assignment => assignment.isDelivered())
      .sort((a, b) => b.delivery!.deliveredOn.localeCompare(a.delivery!.deliveredOn)));

  readonly vacationBalances = this.balancesSignal.asReadonly();

  constructor(private benefitsApi: BenefitsApi) {
    this.loadBenefitTypes();
    this.loadAssignments();
    this.loadVacationBalances();
  }

  // ---------- Queries ----------

  /** Number of employees with a current or upcoming (not cancelled) assignment of the benefit. */
  reachOf(benefitTypeId: number): number {
    const today = new Date().toISOString().substring(0, 10);
    const employees = new Set(this.assignmentsSignal()
      .filter(assignment => assignment.benefitTypeId === benefitTypeId &&
        !assignment.isCancelled() && assignment.validity.endDate >= today)
      .map(assignment => assignment.employeeId));
    return employees.size;
  }

  isBenefitNameTaken(name: string, excludedId: number | null): boolean {
    return this.benefitTypesSignal().some(type => type.id !== excludedId && type.hasSameName(name));
  }

  /** Splits the target employees between the ones that can receive the benefit and the ones in conflict. */
  planAssignment(benefitTypeId: number, employeeIds: number[], validity: DateRange): AssignmentPlan {
    const conflicting = employeeIds.filter(employeeId =>
      this.assignmentsSignal().some(assignment => assignment.conflictsWith(benefitTypeId, employeeId, validity)));
    return {
      employeeIds: employeeIds.filter(employeeId => !conflicting.includes(employeeId)),
      conflictingEmployeeIds: conflicting
    };
  }

  /** Existing assignment that would overlap with a new one for the same employee and benefit. */
  findConflict(benefitTypeId: number, employeeId: number, validity: DateRange): BenefitAssignment | undefined {
    return this.assignmentsSignal().find(assignment => assignment.conflictsWith(benefitTypeId, employeeId, validity));
  }

  getBalanceByEmployeeId(employeeId: number): VacationBalance | undefined {
    return this.balancesSignal().find(balance => balance.employeeId === employeeId);
  }

  // ---------- Benefit catalog ----------

  addBenefitType(benefitType: BenefitType): void {
    if (this.isBenefitNameTaken(benefitType.name, null)) {
      this.errorSignal.set('benefits.error.name-taken');
      return;
    }
    this.startOperation();
    this.benefitsApi.createBenefitType(benefitType).pipe(retry(2)).subscribe({
      next: created => {
        this.benefitTypesSignal.update(types => [...types, created]);
        this.loadingSignal.set(false);
      },
      error: error => this.failOperation(error, 'benefits.error.create-benefit')
    });
  }

  updateBenefitType(benefitType: BenefitType): void {
    if (this.isBenefitNameTaken(benefitType.name, benefitType.id)) {
      this.errorSignal.set('benefits.error.name-taken');
      return;
    }
    this.startOperation();
    this.benefitsApi.updateBenefitType(benefitType).pipe(retry(2)).subscribe({
      next: updated => {
        this.benefitTypesSignal.update(types => types.map(type => type.id === updated.id ? updated : type));
        this.loadingSignal.set(false);
      },
      error: error => this.failOperation(error, 'benefits.error.update-benefit')
    });
  }

  toggleBenefitTypeStatus(benefitType: BenefitType): void {
    const copy = this.typeAssembler.toEntityFromResource(this.typeAssembler.toResourceFromEntity(benefitType));
    if (copy.active) {
      copy.deactivate();
    } else {
      copy.activate();
    }
    this.updateBenefitType(copy);
  }

  // ---------- Assignments ----------

  /**
   * Assigns a benefit to one employee or to every ACTIVE employee of an area.
   * Only active benefit types and active employees; employees that already have the
   * same benefit in an overlapping period are skipped (invariant of BenefitAssignment).
   */
  assignBenefit(command: AssignBenefitCommand): void {
    const benefitType = this.benefitTypesSignal().find(type => type.id === command.benefitTypeId);
    if (!benefitType?.active) {
      this.errorSignal.set('benefits.error.inactive-benefit');
      return;
    }
    const targetIds = command.areaId !== null
      ? this.directory.activeEmployeeIdsOfArea(command.areaId)
      : [command.employeeId].filter((id): id is number => id !== null && !!this.directory.findEmployee(id)?.active);
    if (targetIds.length === 0) {
      this.errorSignal.set('benefits.error.no-active-employees');
      return;
    }
    const plan = this.planAssignment(command.benefitTypeId, targetIds, command.validity);
    if (plan.employeeIds.length === 0) {
      this.errorSignal.set('benefits.error.overlap');
      return;
    }

    const assignments = command.areaId !== null
      ? BenefitAssignment.forArea(command.benefitTypeId, command.areaId, plan.employeeIds, command.validity, command.quantity)
      : [new BenefitAssignment({
          id: 0,
          benefitTypeId: command.benefitTypeId,
          employeeId: plan.employeeIds[0],
          validity: command.validity,
          quantity: command.quantity
        })];

    this.startOperation();
    forkJoin(assignments.map(assignment => this.benefitsApi.createBenefitAssignment(assignment).pipe(retry(2))))
      .subscribe({
        next: created => {
          this.assignmentsSignal.update(current => [...current, ...created]);
          this.loadingSignal.set(false);
        },
        error: error => this.failOperation(error, 'benefits.error.assign-benefit')
      });
  }

  /** A delivery can be registered only once, and never for a cancelled assignment. */
  registerDelivery(assignment: BenefitAssignment, deliveredOn: string, notes: string): void {
    const copy = this.copyAssignment(assignment);
    try {
      copy.registerDelivery(deliveredOn, this.currentEmployee.employeeId(), notes.trim());
    } catch {
      this.errorSignal.set(assignment.isDelivered() ? 'benefits.error.already-delivered' : 'benefits.error.cancelled');
      return;
    }
    this.saveAssignment(copy, 'benefits.error.register-delivery');
  }

  cancelAssignment(assignment: BenefitAssignment): void {
    const copy = this.copyAssignment(assignment);
    try {
      copy.cancel();
    } catch {
      this.errorSignal.set('benefits.error.cancel-delivered');
      return;
    }
    this.saveAssignment(copy, 'benefits.error.cancel-assignment');
  }

  // ---------- Vacation balances ----------

  /** Manual adjustment: requires a reason, keeps the balance non negative and adds a movement. */
  adjustVacationBalance(balance: VacationBalance, days: number, reason: string): void {
    const copy = this.balanceAssembler.toEntityFromResource(this.balanceAssembler.toResourceFromEntity(balance));
    try {
      copy.adjust(days, reason, this.currentEmployee.employeeId());
    } catch {
      this.errorSignal.set('benefits.error.negative-balance');
      return;
    }
    this.startOperation();
    this.benefitsApi.updateVacationBalance(copy).pipe(retry(2)).subscribe({
      next: updated => {
        this.balancesSignal.update(balances => balances.map(current => current.id === updated.id ? updated : current));
        this.loadingSignal.set(false);
      },
      error: error => this.failOperation(error, 'benefits.error.adjust-balance')
    });
  }
  
   debitVacationDays(employeeId: number, days: number, requestId: number): void {
    const balance = this.getBalanceByEmployeeId(employeeId);
    if (!balance) {
      this.errorSignal.set('benefits.error.balance-not-found');
      return;
    }
    const copy = this.balanceAssembler.toEntityFromResource(this.balanceAssembler.toResourceFromEntity(balance));
    try {
      copy.debit(days, requestId);
    } catch {
      this.errorSignal.set('benefits.error.not-enough-days');
      return;
    }
    this.startOperation();
    this.benefitsApi.updateVacationBalance(copy).pipe(retry(2)).subscribe({
      next: updated => {
        this.balancesSignal.update(balances => balances.map(current => current.id === updated.id ? updated : current));
        this.loadingSignal.set(false);
      },
      error: error => this.failOperation(error, 'benefits.error.debit-balance')
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  // ---------- Internals ----------

  private saveAssignment(assignment: BenefitAssignment, errorKey: string): void {
    this.startOperation();
    this.benefitsApi.updateBenefitAssignment(assignment).pipe(retry(2)).subscribe({
      next: updated => {
        this.assignmentsSignal.update(assignments =>
          assignments.map(current => current.id === updated.id ? updated : current));
        this.loadingSignal.set(false);
      },
      error: error => this.failOperation(error, errorKey)
    });
  }

  private copyAssignment(assignment: BenefitAssignment): BenefitAssignment {
    return this.assignmentAssembler.toEntityFromResource(this.assignmentAssembler.toResourceFromEntity(assignment));
  }

  private loadBenefitTypes(): void {
    this.startOperation();
    this.benefitsApi.getBenefitTypes().pipe(takeUntilDestroyed()).subscribe({
      next: types => {
        this.benefitTypesSignal.set(types);
        this.loadingSignal.set(false);
      },
      error: error => this.failOperation(error, 'benefits.error.load-benefits')
    });
  }

  private loadAssignments(): void {
    this.benefitsApi.getBenefitAssignments().pipe(takeUntilDestroyed()).subscribe({
      next: assignments => this.assignmentsSignal.set(assignments),
      error: error => this.errorSignal.set(this.formatError(error, 'benefits.error.load-assignments'))
    });
  }

  private loadVacationBalances(): void {
    this.benefitsApi.getVacationBalances().pipe(takeUntilDestroyed()).subscribe({
      next: balances => this.balancesSignal.set(balances),
      error: error => this.errorSignal.set(this.formatError(error, 'benefits.error.load-balances'))
    });
  }

  private startOperation(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  private failOperation(error: unknown, errorKey: string): void {
    this.errorSignal.set(this.formatError(error, errorKey));
    this.loadingSignal.set(false);
  }

  /** Returns the i18n key of the failed operation; the raw HTTP message is only logged. */
  private formatError(error: unknown, errorKey: string): string {
    console.error(errorKey, error);
    return errorKey;
  }

}
