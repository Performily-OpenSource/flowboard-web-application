import {computed, DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subscription} from 'rxjs';
import {DateRange} from '../../shared/domain/model/date-range';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {BenefitsApi} from '../infrastructure/benefits-api';
import {BenefitsWebServiceError} from '../infrastructure/benefits-web-service-error';
import {WorkspaceAcl} from '../infrastructure/workspace-acl';
import {CurrentEmployeeStore} from '../../shared/application/current-employee.store';
import {localToday} from './local-today';

/**
 * Data needed to assign a benefit to one employee or to a whole area.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface AssignBenefitCommand {
  benefitTypeId: number;
  employeeId: number | null;
  areaId: number | null;
  validity: DateRange;
  quantity: number;
}

/**
 * Result of checking which employees can receive a benefit in a period.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface AssignmentPlan {
  /** Employees that will receive the benefit. */
  employeeIds: number[];
  /** Employees that already have the same benefit in an overlapping period. */
  conflictingEmployeeIds: number[];
}

/**
 * What the web service would do with an assignment to an area, before confirming it.
 *
 * @remarks Keeps the request it answers, so a view can check that it still matches its form.
 * @author Salym
 */
export interface AreaAssignmentPreview {
  benefitTypeId: number;
  areaId: number;
  startDate: string;
  endDate: string;
  /** Active employees of the area. */
  activeEmployees: number;
  /** Employees that already have the benefit in the period and will be skipped. */
  alreadyAssigned: number;
  /** Employees that will receive the benefit. */
  toAssign: number;
}

/**
 * Message shown to the user after a write operation finishes well.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
export interface BenefitsNotice {
  /** i18n key of the message. */
  key: string;
  /** Values used by the message. */
  params?: Record<string, unknown>;
  /** Action that reverts the operation, shown as "Undo". */
  undo?: () => void;
}

/**
 * Translates an error of the web service to an i18n key of the context, or returns null to show the
 * reason sent by the web service.
 *
 * @remarks Defines the data contract used between layers or components of the bounded context.
 * @author Salym
 */
type KnownErrorResolver = (error: BenefitsWebServiceError) => string | null;

@Injectable({providedIn: 'root'})
/**
 * Centralizes the Benefits context state and calls the actions of the Flowboard Web Service for the
 * catalog, assignments, deliveries and vacation balances.
 *
 * @remarks The business rules are checked here first, so the user gets the message without a call,
 * but the web service decides: when it rejects an action its reason is shown (the known rules are
 * translated to the i18n keys of the context). Vacation usage and reversal are applied by the web
 * service when a vacation request is approved or cancelled, so the store never debits days.
 * @author Salym
 */
export class BenefitsStore {
  private readonly directory = inject(WorkspaceAcl);
  private readonly currentEmployee = inject(CurrentEmployeeStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly benefitTypesSignal = signal<BenefitType[]>([]);
  private readonly assignmentsSignal = signal<BenefitAssignment[]>([]);
  private readonly balancesSignal = signal<VacationBalance[]>([]);

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  /** i18n key of the last error, or the reason sent by the web service. */
  readonly error = this.errorSignal.asReadonly();

  private readonly noticeSignal = signal<BenefitsNotice | null>(null);
  /** Last success message, consumed by the feedback component. */
  readonly notice = this.noticeSignal.asReadonly();

  private readonly typesLoaded = signal(false);
  private readonly assignmentsLoaded = signal(false);
  private readonly balancesLoaded = signal(false);
  /** Whether the first load of the catalog, assignments and balances finished (well or with an error). */
  readonly ready = computed(() => this.typesLoaded() && this.assignmentsLoaded() && this.balancesLoaded());

  private readonly highlightedTypeIdSignal = signal<number | null>(null);
  /** Benefit type created last, highlighted in the catalog for a moment. */
  readonly highlightedTypeId = this.highlightedTypeIdSignal.asReadonly();

  private readonly areaPreviewSignal = signal<AreaAssignmentPreview | null>(null);
  /** Last preview of an assignment to an area answered by the web service. */
  readonly areaPreview = this.areaPreviewSignal.asReadonly();
  private areaPreviewSubscription: Subscription | null = null;

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

  /**
   * Initializes the store and loads the catalog, assignments and vacation balances.
   * @param benefitsApi Facade used to call the Benefits endpoints of the web service.
   * @author Salym
   */
  constructor(private benefitsApi: BenefitsApi) {
    this.loadBenefitTypes();
    this.loadAssignments();
    this.loadVacationBalances();
  }

  // ---------- Queries ----------

  /**
   * Counts the employees with a current or upcoming (not cancelled) assignment of the benefit.
   * @param benefitTypeId Identifier of the benefit type.
   * @author Salym
   */
  reachOf(benefitTypeId: number): number {
    const today = localToday();
    const employees = new Set(this.assignmentsSignal()
      .filter(assignment => assignment.benefitTypeId === benefitTypeId &&
        !assignment.isCancelled() && assignment.validity.endDate >= today)
      .map(assignment => assignment.employeeId));
    return employees.size;
  }

  /**
   * Determines whether another benefit of the catalog already uses the name.
   * @param name Name to compare or validate.
   * @param excludedId Identifier of the benefit being edited, ignored in the comparison (null when
   *   creating).
   * @author Salym
   */
  isBenefitNameTaken(name: string, excludedId: number | null): boolean {
    return this.benefitTypesSignal().some(type => type.id !== excludedId && type.hasSameName(name));
  }

  /**
   * Splits the target employees between the ones that can receive the benefit and the ones that
   * already have it in an overlapping period.
   * @param benefitTypeId Identifier of the benefit type.
   * @param employeeIds Identifiers of the employees that should receive the benefit.
   * @param validity Validity period of the assignment.
   * @remarks It is a local check made with the assignments already loaded; for an area the web service
   * answers the same question with previewAreaAssignment.
   * @author Salym
   */
  planAssignment(benefitTypeId: number, employeeIds: number[], validity: DateRange): AssignmentPlan {
    const conflicting = employeeIds.filter(employeeId =>
      this.assignmentsSignal().some(assignment => assignment.conflictsWith(benefitTypeId, employeeId, validity)));
    return {
      employeeIds: employeeIds.filter(employeeId => !conflicting.includes(employeeId)),
      conflictingEmployeeIds: conflicting
    };
  }

  /**
   * Finds the existing assignment that would overlap a new one for the same employee and benefit.
   * @param benefitTypeId Identifier of the benefit type.
   * @param employeeId Identifier of the employee (EmployeeId of the Shared Kernel).
   * @param validity Validity period of the new assignment.
   * @author Salym
   */
  findConflict(benefitTypeId: number, employeeId: number, validity: DateRange): BenefitAssignment | undefined {
    return this.assignmentsSignal().find(assignment => assignment.conflictsWith(benefitTypeId, employeeId, validity));
  }

  /**
   * Finds the vacation balance of an employee.
   * @param employeeId Identifier of the employee (EmployeeId of the Shared Kernel).
   * @author Salym
   */
  getBalanceByEmployeeId(employeeId: number): VacationBalance | undefined {
    return this.balancesSignal().find(balance => balance.employeeId === employeeId);
  }

  /**
   * Asks the web service what an assignment to an area would do and publishes the answer in
   * areaPreview. A new call replaces the one still running.
   * @param benefitTypeId Identifier of the benefit type.
   * @param areaId Identifier of the area (AreaId of the Shared Kernel).
   * @param validity Validity period of the assignment.
   * @author Salym
   */
  previewAreaAssignment(benefitTypeId: number, areaId: number, validity: DateRange): void {
    this.areaPreviewSubscription?.unsubscribe();
    this.areaPreviewSignal.set(null);
    this.areaPreviewSubscription = this.benefitsApi
      .previewAreaAssignment(benefitTypeId, areaId, validity.startDate, validity.endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: preview => this.areaPreviewSignal.set({
          benefitTypeId,
          areaId,
          startDate: validity.startDate,
          endDate: validity.endDate,
          activeEmployees: preview.activeEmployees,
          alreadyAssigned: preview.alreadyAssigned,
          toAssign: preview.toAssign
        }),
        error: error => console.error('benefits.error.area-preview', error)
      });
  }

  /**
   * Forgets the last preview of an assignment to an area.
   * @author Salym
   */
  clearAreaPreview(): void {
    this.areaPreviewSubscription?.unsubscribe();
    this.areaPreviewSignal.set(null);
  }

  // ---------- Benefit catalog ----------

  /**
   * Creates a benefit in the catalog after checking that its name is unique.
   * @param benefitType Benefit type to create.
   * @author Salym
   */
  addBenefitType(benefitType: BenefitType): void {
    if (this.isBenefitNameTaken(benefitType.name, null)) {
      this.errorSignal.set('benefits.error.name-taken');
      return;
    }
    this.startOperation();
    this.benefitsApi.createBenefitType(benefitType).subscribe({
      next: created => {
        this.benefitTypesSignal.update(types => [...types, created]);
        this.highlightedTypeIdSignal.set(created.id);
        setTimeout(() => this.highlightedTypeIdSignal.set(null), 4000);
        this.succeed({ key: 'benefits.notice.benefit-created', params: { name: created.name } });
      },
      error: error => this.failOperation(error, 'benefits.error.create-benefit',
        failure => failure.status === 409 ? 'benefits.error.name-taken' : null)
    });
  }

  /**
   * Updates a benefit of the catalog after checking that its name is unique.
   * @param benefitType Benefit type with the new data.
   * @param notice Message shown when the update finishes well.
   * @remarks Ready for PUT /benefit-types/{id}, which the web service does not have yet: until it
   * exists the catalog hides the edit action, so this method is not called.
   * @author Salym
   */
  updateBenefitType(benefitType: BenefitType,
                    notice: BenefitsNotice = { key: 'benefits.notice.benefit-updated', params: { name: benefitType.name } }): void {
    if (this.isBenefitNameTaken(benefitType.name, benefitType.id)) {
      this.errorSignal.set('benefits.error.name-taken');
      return;
    }
    this.startOperation();
    this.benefitsApi.updateBenefitType(benefitType).subscribe({
      next: updated => {
        this.replaceBenefitType(updated);
        this.succeed(notice);
      },
      error: error => this.failOperation(error, 'benefits.error.update-benefit',
        failure => failure.status === 409 ? 'benefits.error.name-taken' : null)
    });
  }

  /**
   * Activates or deactivates a benefit of the catalog with the action of the web service.
   * @param benefitType Benefit type of the catalog.
   * @author Salym
   */
  toggleBenefitTypeStatus(benefitType: BenefitType): void {
    const activate = !benefitType.active;
    this.startOperation();
    const action = activate
      ? this.benefitsApi.activateBenefitType(benefitType.id)
      : this.benefitsApi.deactivateBenefitType(benefitType.id);
    action.subscribe({
      next: updated => {
        this.replaceBenefitType(updated);
        this.succeed({
          key: updated.active ? 'benefits.notice.benefit-activated' : 'benefits.notice.benefit-deactivated',
          params: { name: updated.name },
          undo: () => this.toggleBenefitTypeStatus(updated)
        });
      },
      error: error => this.failOperation(error, 'benefits.error.update-benefit')
    });
  }

  // ---------- Assignments ----------

  /**
   * Assigns a benefit to one employee or to every ACTIVE employee of an area. Only active benefit
   * types and active employees are allowed; employees that already have the same benefit in an
   * overlapping period are skipped.
   * @param command Data of the assignment entered in the dialog.
   * @remarks The rules are checked first with the loaded data; then one call to the web service
   * creates the assignments (for an area it creates one per active employee and skips the ones that
   * overlap).
   * @author Salym
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

    this.startOperation();
    this.benefitsApi.assignBenefit({
      benefitTypeId: command.benefitTypeId,
      employeeId: command.areaId !== null ? null : command.employeeId,
      areaId: command.areaId,
      quantity: command.quantity,
      startDate: command.validity.startDate,
      endDate: command.validity.endDate
    }).subscribe({
      next: batch => {
        this.assignmentsSignal.update(current => [...current, ...batch.assignments]);
        this.clearAreaPreview();
        this.succeed({
          key: `benefits.notice.benefit-assigned.${batch.assignedCount === 1 ? 'one' : 'other'}`,
          params: { count: batch.assignedCount }
        });
      },
      error: error => this.failOperation(error, 'benefits.error.assign-benefit', failure => {
        if (failure.status === 409) return 'benefits.error.overlap';
        if (failure.status !== 422) return null;
        if (/no active employees/i.test(failure.message)) return 'benefits.error.no-active-employees';
        return /benefit type/i.test(failure.message) ? 'benefits.error.inactive-benefit' : null;
      })
    });
  }

  /**
   * Registers the delivery of an assignment. A delivery can be registered only once and never for a
   * cancelled assignment; the current employee is saved as its author.
   * @param assignment Benefit assignment to work with.
   * @param deliveredOn Date of the delivery (yyyy-MM-dd).
   * @param notes Optional notes about the delivery.
   * @author Salym
   */
  registerDelivery(assignment: BenefitAssignment, deliveredOn: string, notes: string): void {
    if (assignment.isDelivered() || assignment.isCancelled()) {
      this.errorSignal.set(assignment.isDelivered() ? 'benefits.error.already-delivered' : 'benefits.error.cancelled');
      return;
    }
    this.startOperation();
    this.benefitsApi.registerDelivery(assignment.id, {
      deliveredOn,
      registeredById: this.currentEmployee.employeeId(),
      notes: notes.trim() || null
    }).subscribe({
      next: updated => {
        this.replaceAssignment(updated);
        this.succeed({ key: 'benefits.notice.delivery-registered', params: { name: assignment.benefitType?.name ?? '' } });
      },
      error: error => this.failOperation(error, 'benefits.error.register-delivery')
    });
  }

  /**
   * Cancels an assignment that was not delivered yet.
   * @param assignment Benefit assignment to work with.
   * @author Salym
   */
  cancelAssignment(assignment: BenefitAssignment): void {
    if (assignment.isDelivered()) {
      this.errorSignal.set('benefits.error.cancel-delivered');
      return;
    }
    this.startOperation();
    this.benefitsApi.cancelAssignment(assignment.id).subscribe({
      next: updated => {
        this.replaceAssignment(updated);
        this.succeed({ key: 'benefits.notice.assignment-cancelled', params: { name: assignment.benefitType?.name ?? '' } });
      },
      error: error => this.failOperation(error, 'benefits.error.cancel-assignment')
    });
  }

  // ---------- Vacation balances ----------

  /**
   * Applies a manual adjustment to a vacation balance. It requires a reason, keeps the balance non
   * negative and adds a movement with the current employee as author.
   * @param balance Vacation balance of the employee.
   * @param days Signed days of the adjustment: positive adds, negative removes.
   * @param reason Reason of the change, kept in the movement history.
   * @remarks The web service receives the operation (ADD or DEDUCT) and the days without sign.
   * @author Salym
   */
  adjustVacationBalance(balance: VacationBalance, days: number, reason: string): void {
    if (days === 0 || !reason?.trim() || balance.availableAfterAdjustment(days) < 0) {
      this.errorSignal.set('benefits.error.negative-balance');
      return;
    }
    this.startOperation();
    this.benefitsApi.adjustVacationBalance(balance.employeeId, {
      operation: days > 0 ? 'ADD' : 'DEDUCT',
      days: Math.abs(days),
      reason: reason.trim(),
      authorId: this.currentEmployee.employeeId()
    }).subscribe({
      next: updated => {
        this.replaceBalance(updated);
        this.succeed({ key: 'benefits.notice.balance-adjusted' });
      },
      error: error => this.failOperation(error, 'benefits.error.adjust-balance',
        failure => failure.status === 422 && /negative/i.test(failure.message) ? 'benefits.error.negative-balance' : null)
    });
  }

  /**
   * Loads the movements of the vacation balance of an employee and keeps them in its balance. The
   * list of balances of the web service comes without movements.
   * @param employeeId Identifier of the employee (EmployeeId of the Shared Kernel).
   * @author Salym
   */
  loadMovements(employeeId: number): void {
    this.benefitsApi.getVacationMovements(employeeId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: movements => {
        const balance = this.getBalanceByEmployeeId(employeeId);
        if (!balance) return;
        this.replaceBalance(new VacationBalance({
          id: balance.id,
          employeeId: balance.employeeId,
          accruedDays: balance.accruedDays,
          usedDays: balance.usedDays,
          movements
        }));
      },
      error: error => this.errorSignal.set(this.formatError(error, 'benefits.error.load-balances'))
    });
  }

  /**
   * Loads again the vacation balances from the web service.
   * @remarks The web service changes the balances when a vacation request is approved or cancelled
   * (RequestApprovedEvent / RequestCancelledEvent), so Request should call this method after those
   * actions to show the new balances without reloading the page.
   * @author Salym
   */
  reloadVacationBalances(): void {
    this.loadVacationBalances();
  }

  /**
   * Clears the error shown in the views.
   * @author Salym
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Clears the success message once it was shown.
   * @author Salym
   */
  clearNotice(): void {
    this.noticeSignal.set(null);
  }

  // ---------- Internals ----------

  /**
   * Replaces a benefit type of the state with the answer of the web service.
   * @param benefitType Benefit type returned by the web service.
   * @author Salym
   */
  private replaceBenefitType(benefitType: BenefitType): void {
    this.benefitTypesSignal.update(types => types.map(type => type.id === benefitType.id ? benefitType : type));
  }

  /**
   * Replaces an assignment of the state with the answer of the web service.
   * @param assignment Benefit assignment returned by the web service.
   * @author Salym
   */
  private replaceAssignment(assignment: BenefitAssignment): void {
    this.assignmentsSignal.update(assignments =>
      assignments.map(current => current.id === assignment.id ? assignment : current));
  }

  /**
   * Replaces the vacation balance of an employee with the answer of the web service.
   * @param balance Vacation balance returned by the web service.
   * @author Salym
   */
  private replaceBalance(balance: VacationBalance): void {
    this.balancesSignal.update(balances =>
      balances.map(current => current.employeeId === balance.employeeId ? balance : current));
  }

  /**
   * Loads the benefit catalog from the API.
   * @author Salym
   */
  private loadBenefitTypes(): void {
    this.startOperation();
    this.benefitsApi.getBenefitTypes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: types => {
        this.benefitTypesSignal.set(types);
        this.loadingSignal.set(false);
        this.typesLoaded.set(true);
      },
      error: error => {
        this.failOperation(error, 'benefits.error.load-benefits');
        this.typesLoaded.set(true);
      }
    });
  }

  /**
   * Loads the benefit assignments from the API.
   * @author Salym
   */
  private loadAssignments(): void {
    this.benefitsApi.getBenefitAssignments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: assignments => {
        this.assignmentsSignal.set(assignments);
        this.assignmentsLoaded.set(true);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'benefits.error.load-assignments'));
        this.assignmentsLoaded.set(true);
      }
    });
  }

  /**
   * Loads the vacation balances from the API.
   * @author Salym
   */
  private loadVacationBalances(): void {
    this.benefitsApi.getVacationBalances().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: balances => {
        this.balancesSignal.set(balances);
        this.balancesLoaded.set(true);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'benefits.error.load-balances'));
        this.balancesLoaded.set(true);
      }
    });
  }

  /**
   * Marks the start of an operation: shows the loading bar and clears the error.
   * @author Salym
   */
  private startOperation(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  /**
   * Marks the end of a successful operation and publishes its message.
   * @param notice Message shown to the user.
   * @author Salym
   */
  private succeed(notice: BenefitsNotice): void {
    this.loadingSignal.set(false);
    this.noticeSignal.set(notice);
  }

  /**
   * Marks the end of a failed operation and shows its error.
   * @param error Error returned by the API.
   * @param errorKey i18n key of the error shown when the web service does not explain it.
   * @param knownErrors Translates the known rejections of the web service to i18n keys.
   * @author Salym
   */
  private failOperation(error: unknown, errorKey: string, knownErrors?: KnownErrorResolver): void {
    this.errorSignal.set(this.formatError(error, errorKey, knownErrors));
    this.loadingSignal.set(false);
  }

  /**
   * Chooses the message of a failed operation: the i18n key of a known rule, the reason sent by the
   * web service, or the i18n key of the operation when the web service did not answer.
   * @param error Error returned by the API.
   * @param errorKey i18n key of the error shown when the web service does not explain it.
   * @param knownErrors Translates the known rejections of the web service to i18n keys.
   * @author Salym
   */
  private formatError(error: unknown, errorKey: string, knownErrors?: KnownErrorResolver): string {
    console.error(errorKey, error);
    if (!(error instanceof BenefitsWebServiceError) || error.isUnavailable()) return errorKey;
    return knownErrors?.(error) ?? (error.message || errorKey);
  }
}
