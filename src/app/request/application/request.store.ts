import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable, retry} from 'rxjs';
import {CurrentEmployeeStore} from '../../shared/application/current-employee.store';
import {RequestApi} from '../infrastructure/request-api';
import {WorkspaceAcl} from '../infrastructure/workspace-acl';
import {BenefitsAcl} from '../infrastructure/benefits-acl';
import {RequestAssembler} from '../infrastructure/request-assembler';
import {RequestTypeAssembler} from '../infrastructure/request-type-assembler';
import {
  ApproverType,
  countWorkingDays,
  Request,
  RequestAttachment,
  RequestFieldValue,
  RequestStatus
} from '../domain/model/request.entity';
import {RequestType} from '../domain/model/request-type.entity';
import {RequestHistory} from '../domain/model/request-history.entity';
import {Requester} from '../domain/model/requester.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';

/**
 * Error of the Request bounded context, shown through ngx-translate.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestError {
  /** Translation key of the message, e.g. 'request-error.insufficient-balance'. */
  key: string;
  /** Values inserted in the message. */
  params: Record<string, unknown>;
}

/**
 * Period read from the field values of a request form.
 *
 * @author Diego Alonso Diaz Villalba
 */
export interface RequestPeriodValues {
  /** First day, or null. */
  startDate: string | null;
  /** Last day; equals startDate when the field is empty. */
  endDate: string | null;
  /** Start time, or null. */
  startTime: string | null;
  /** End time, or null. */
  endTime: string | null;
}

/**
 * Application service that holds the state of the Request bounded context.
 *
 * @remarks
 * Keeps requests, request types and requesters in private signals and exposes them as read-only or
 * computed signals. It validates and submits requests, routes them to the approver, applies the status
 * changes (approve, reject, return for review, cancel) and manages the request types. Workspace and
 * Benefits are reached only through the WorkspaceAcl and the BenefitsAcl.
 * @author Diego Alonso Diaz Villalba
 */
@Injectable({providedIn: 'root'})
export class RequestStore {
  /** Requests loaded from the API. */
  private readonly requestsSignal = signal<Request[]>([]);
  /** Request types loaded from the API. */
  private readonly requestTypesSignal = signal<RequestType[]>([]);
  /** Employees translated by the WorkspaceAcl. */
  private readonly requestersSignal = signal<Requester[]>([]);

  /** Whether a load or write operation is in progress. */
  private readonly loadingSignal = signal<boolean>(false);
  /** Read-only loading state. */
  readonly loading = this.loadingSignal.asReadonly();

  /** Last error, or null when there is none. */
  private readonly errorSignal = signal<RequestError | null>(null);
  /** Read-only error. */
  readonly error = this.errorSignal.asReadonly();

  /** Employee in session, shared by every bounded context. */
  private readonly currentEmployeeStore = inject(CurrentEmployeeStore);
  /** Identifier of the employee in session. */
  readonly currentEmployeeId = this.currentEmployeeStore.employeeId;

  /** Read-only list of requesters. */
  readonly requesters = this.requestersSignal.asReadonly();
  /** The employee in session as a Requester, or null while loading. */
  readonly currentEmployee = computed(() => this.getRequester(this.currentEmployeeId()));

  /** All request types, sorted by identifier. */
  readonly requestTypes = computed(() => [...this.requestTypesSignal()].sort((a, b) => a.id - b.id));
  /** Request types that employees can use. */
  readonly activeRequestTypes = computed(() => this.requestTypes().filter(type => type.active));

  /** All requests with their request type linked, newest first. */
  readonly requests = computed(() => {
    const types = this.requestTypesSignal();
    return this.requestsSignal()
      .map(request => {
        request.requestType = types.find(type => type.id === request.requestTypeId) ?? null;
        return request;
      })
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  });

  /** Requests submitted by the employee in session (US32). */
  readonly myRequests = computed(() => this.requests().filter(request => request.isOwnedBy(this.currentEmployeeId())));

  /** Requests of every other employee, shown in the Human Resources inbox (US31). */
  readonly inboxRequests = computed(() => this.requests().filter(request => !request.isOwnedBy(this.currentEmployeeId())));

  /** Vacation balance of the employee in session, or null. */
  readonly myVacationBalance = computed(() => this.getVacationBalance(this.currentEmployeeId()));

  /**
   * Creates the store and loads requesters, request types and requests.
   *
   * @param requestApi - The API facade of the Request bounded context.
   * @param workspaceAcl - The anti-corruption layer to Workspace.
   * @param benefitsAcl - The anti-corruption layer to Benefits.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(private requestApi: RequestApi, private workspaceAcl: WorkspaceAcl, private benefitsAcl: BenefitsAcl) {
    this.loadRequesters();
    this.loadRequestTypes();
    this.loadRequests();
  }

  /**
   * Gets a request type by its identifier.
   *
   * @param id - The request type identifier.
   * @returns A signal with the request type, or undefined if not found
   * @author Diego Alonso Diaz Villalba
   */
  getRequestTypeById(id: number): Signal<RequestType | undefined> {
    return computed(() => id ? this.requestTypes().find(type => type.id === id) : undefined);
  }

  /**
   * Gets a requester by its identifier.
   *
   * @param id - The employee identifier, or null.
   * @returns The requester, or null if not found
   * @author Diego Alonso Diaz Villalba
   */
  getRequester(id: number | null): Requester | null {
    return id === null ? null : this.requestersSignal().find(requester => requester.id === id) ?? null;
  }

  /**
   * Gets the requests of one employee, newest first. Used by the employee file of Workspace and the dashboard.
   *
   * @param employeeId - The employee identifier.
   * @returns The requests of the employee
   * @author Diego Alonso Diaz Villalba
   */
  requestsOf(employeeId: number): Request[] {
    return this.requests().filter(request => request.isOwnedBy(employeeId));
  }

  /**
   * Gets the vacation balance of an employee.
   *
   * @param employeeId - The employee identifier.
   * @returns The balance, or null if the employee has none
   * @author Diego Alonso Diaz Villalba
   */
  getVacationBalance(employeeId: number): VacationBalance | null {
    return this.benefitsAcl.vacationBalances().find(balance => balance.employeeId === employeeId) ?? null;
  }

  /**
   * Decides who must resolve a request of the requester.
   *
   * @remarks It goes to the direct manager when the employee has an active one; otherwise to Human Resources.
   * @param requester - The employee who submits the request.
   * @returns The approver type and the manager identifier (null for Human Resources)
   * @author Diego Alonso Diaz Villalba
   */
  resolveApprover(requester: Requester | null): { approverType: ApproverType; approverId: number | null } {
    const manager = this.getRequester(requester?.directManagerId ?? null);
    return manager && manager.active
      ? { approverType: 'DIRECT_MANAGER', approverId: manager.id }
      : { approverType: 'HR_STAFF', approverId: null };
  }

  /**
   * Gets the name of the manager who must resolve a request.
   *
   * @param request - The request.
   * @returns The manager's full name, or null when it goes to Human Resources
   * @author Diego Alonso Diaz Villalba
   */
  approverName(request: Request): string | null {
    return request.isRoutedToHr() ? null : this.getRequester(request.approverId)?.fullName ?? null;
  }

  /**
   * Counts the requests submitted with a request type.
   *
   * @param requestTypeId - The request type identifier.
   * @returns The number of requests
   * @author Diego Alonso Diaz Villalba
   */
  countRequestsOfType(requestTypeId: number): number {
    return this.requestsSignal().filter(request => request.requestTypeId === requestTypeId).length;
  }

  /**
   * Checks whether another request type already uses a name, ignoring case and spaces.
   *
   * @param name - The name to check.
   * @param excludedId - The type being edited, or null for a new one.
   * @returns True if the name is taken, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isRequestTypeNameTaken(name: string, excludedId: number | null): boolean {
    const normalized = name.trim().toLowerCase();
    return this.requestTypesSignal().some(type => type.id !== excludedId && type.name.trim().toLowerCase() === normalized);
  }

  /**
   * Reads the period from the values of a request form.
   *
   * @param fieldValues - The values entered.
   * @returns The period; the end date defaults to the start date
   * @author Diego Alonso Diaz Villalba
   */
  periodFrom(fieldValues: RequestFieldValue[]): RequestPeriodValues {
    const valueOf = (key: string) => fieldValues.find(value => value.key === key)?.value || null;
    const startDate = valueOf('startDate');
    return {
      startDate,
      endDate: valueOf('endDate') ?? startDate,
      startTime: valueOf('startTime'),
      endTime: valueOf('endTime')
    };
  }

  /**
   * Validates that the period ends after it starts.
   *
   * @param period - The period to validate.
   * @returns The error, or null when the period is valid
   * @author Diego Alonso Diaz Villalba
   */
  periodError(period: RequestPeriodValues): RequestError | null {
    if (period.startDate && period.endDate && period.endDate < period.startDate) {
      return { key: 'request-error.period-end-before-start', params: {} };
    }
    if (period.startTime && period.endTime && period.endTime <= period.startTime) {
      return { key: 'request-error.period-end-time-before-start', params: {} };
    }
    return null;
  }

  /**
   * Counts the working days requested in a form.
   *
   * @param requestType - The selected request type, or null.
   * @param period - The period entered.
   * @returns The working days, or 0 when the type has no period, is measured in hours or the period is invalid
   * @author Diego Alonso Diaz Villalba
   */
  requestedDays(requestType: RequestType | null, period: RequestPeriodValues): number {
    if (!requestType?.hasPeriod() || requestType.isMeasuredInHours() || !period.startDate || !period.endDate) return 0;
    return period.endDate < period.startDate ? 0 : countWorkingDays(period.startDate, period.endDate);
  }

  /**
   * Validates a request before submitting it (US29, US30): required fields, attachment, period and
   * vacation balance.
   *
   * @param requestType - The request type.
   * @param fieldValues - The values entered.
   * @param attachments - The attached files.
   * @returns The first error found, or null when the request is valid
   * @author Diego Alonso Diaz Villalba
   */
  checkBeforeSubmit(requestType: RequestType, fieldValues: RequestFieldValue[], attachments: RequestAttachment[]): RequestError | null {
    const missing = requestType.fields.filter(field =>
      field.required && !fieldValues.find(value => value.key === field.key)?.value?.trim());
    if (missing.length > 0) {
      return { key: 'request-error.missing-fields', params: { fields: missing.map(field => field.label).join(', ') } };
    }
    if (requestType.requiresAttachment && attachments.length === 0) {
      return { key: 'request-error.attachment-required', params: {} };
    }
    const period = this.periodFrom(fieldValues);
    const periodError = this.periodError(period);
    if (periodError) return periodError;
    if (requestType.deductsVacationDays()) {
      const balance = this.myVacationBalance();
      const days = this.requestedDays(requestType, period);
      if (!balance) return { key: 'request-error.balance-not-found', params: {} };
      if (!balance.hasEnough(days)) {
        return { key: 'request-error.insufficient-balance', params: { available: balance.availableDays, requested: days } };
      }
    }
    return null;
  }

  /**
   * Submits a new request of the employee in session (US29).
   * It starts 'IN_PROGRESS', routed to the direct manager or to Human Resources.
   *
   * @param requestType - The request type.
   * @param fieldValues - The values entered.
   * @param attachments - The attached files.
   * @returns True if the request passed the validations and was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  submitRequest(requestType: RequestType, fieldValues: RequestFieldValue[], attachments: RequestAttachment[]): boolean {
    const requester = this.currentEmployee();
    if (!requester || !this.passes(this.checkBeforeSubmit(requestType, fieldValues, attachments))) return false;
    const now = new Date().toISOString();
    const period = requestType.hasPeriod() ? this.periodFrom(fieldValues) : null;
    const { approverType, approverId } = this.resolveApprover(requester);
    const request = new Request({
      id: 0,
      requesterId: requester.id,
      requestTypeId: requestType.id,
      startDate: period?.startDate,
      endDate: period?.endDate,
      startTime: period?.startTime,
      endTime: period?.endTime,
      fieldValues,
      attachments,
      approverType,
      approverId,
      status: 'IN_PROGRESS',
      submittedAt: now,
      history: [new RequestHistory({ id: 1, previousStatus: null, newStatus: 'IN_PROGRESS', actorId: requester.id, occurredAt: now })]
    });
    this.persist(this.requestApi.createRequest(request), created =>
      this.requestsSignal.update(requests => [...requests, created]), 'Failed to submit request');
    return true;
  }

  /**
   * Sends again a request that was returned for review, with the corrected data.
   * It goes back to 'IN_PROGRESS'.
   *
   * @param request - The request under review.
   * @param requestType - The request type.
   * @param fieldValues - The corrected values.
   * @param attachments - The attached files.
   * @returns True if it was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  resubmitRequest(request: Request, requestType: RequestType, fieldValues: RequestFieldValue[], attachments: RequestAttachment[]): boolean {
    const actor = this.currentEmployee();
    if (!actor || !request.isUnderReview() || !request.isOwnedBy(actor.id)) return this.fail('request-error.not-under-review');
    if (!this.passes(this.checkBeforeSubmit(requestType, fieldValues, attachments))) return false;
    const updated = this.copyRequest(request);
    const period = requestType.hasPeriod() ? this.periodFrom(fieldValues) : null;
    updated.fieldValues = fieldValues;
    updated.attachments = attachments;
    updated.startDate = period?.startDate ?? null;
    updated.endDate = period?.endDate ?? null;
    updated.startTime = period?.startTime ?? null;
    updated.endTime = period?.endTime ?? null;
    this.changeStatus(updated, 'IN_PROGRESS', actor.id, null);
    return true;
  }

  /**
   * Checks whether the employee in session can resolve a request.
   *
   * @param request - The request.
   * @returns True if it is pending and was not submitted by the employee in session, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  canResolve(request: Request): boolean {
    // Human Resources can resolve any pending request, except its own
    return request.isPending() && !request.isOwnedBy(this.currentEmployeeId());
  }

  /**
   * Approves a pending request (US31). Vacation requests then ask Benefits to debit the days.
   *
   * @param request - The request to approve.
   * @param comment - Optional comment of the approver.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  approveRequest(request: Request, comment: string | null): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    const updated = this.copyRequest(request);
    this.changeStatus(updated, 'APPROVED', this.currentEmployeeId(), comment?.trim() || null,
      () => this.notifyBenefitsOfApproval(updated));
    return true;
  }

  /**
   * Rejects a pending request (US31). The reason is required.
   *
   * @param request - The request to reject.
   * @param reason - The reason shown to the employee.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  rejectRequest(request: Request, reason: string): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    if (!reason.trim()) return this.fail('request-error.reason-required');
    this.changeStatus(this.copyRequest(request), 'REJECTED', this.currentEmployeeId(), reason.trim());
    return true;
  }

  /**
   * Returns a pending request to the employee to complete it (status 'UNDER_REVIEW'). The comment is required.
   *
   * @param request - The request to return.
   * @param comment - What the employee must complete.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  returnRequestForReview(request: Request, comment: string): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    if (!comment.trim()) return this.fail('request-error.comment-required');
    this.changeStatus(this.copyRequest(request), 'UNDER_REVIEW', this.currentEmployeeId(), comment.trim());
    return true;
  }

  /**
   * Cancels a request of the employee in session that is not resolved yet (US33).
   *
   * @param request - The request to cancel.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  cancelRequest(request: Request): boolean {
    if (!request.canBeCancelled()) return this.fail('request-error.already-resolved');
    if (!request.isOwnedBy(this.currentEmployeeId())) return this.fail('request-error.not-owner');
    this.changeStatus(this.copyRequest(request), 'CANCELLED', this.currentEmployeeId(), null);
    return true;
  }

  /**
   * Adds a request type (US28). The name must be unique.
   *
   * @param requestType - The request type to add.
   * @returns True if it was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  addRequestType(requestType: RequestType): boolean {
    if (this.isRequestTypeNameTaken(requestType.name, null)) return this.fail('request-error.type-duplicated');
    this.persist(this.requestApi.createRequestType(requestType), created =>
      this.requestTypesSignal.update(types => [...types, created]), 'Failed to add request type');
    return true;
  }

  /**
   * Updates a request type. The name must be unique.
   *
   * @param requestType - The request type with its new data.
   * @returns True if it was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  updateRequestType(requestType: RequestType): boolean {
    if (this.isRequestTypeNameTaken(requestType.name, requestType.id)) return this.fail('request-error.type-duplicated');
    this.persist(this.requestApi.updateRequestType(requestType), updated =>
      this.requestTypesSignal.update(types => types.map(type => type.id === updated.id ? updated : type)),
      'Failed to update request type');
    return true;
  }

  /**
   * Activates or deactivates a request type (US27).
   *
   * @param requestType - The request type.
   * @author Diego Alonso Diaz Villalba
   */
  toggleRequestTypeStatus(requestType: RequestType): void {
    const updated = this.copyRequestType(requestType);
    updated.active = !updated.active;
    this.updateRequestType(updated);
  }

  /**
   * Deletes a request type that has no requests.
   *
   * @remarks A type in use cannot be deleted; it can be deactivated instead.
   * @param requestType - The request type to delete.
   * @returns True if it was sent, false if the type is in use
   * @author Diego Alonso Diaz Villalba
   */
  deleteRequestType(requestType: RequestType): boolean {
    if (this.countRequestsOfType(requestType.id) > 0) {
      this.errorSignal.set({ key: 'request-error.type-in-use', params: { name: requestType.name } });
      return false;
    }
    this.persist(this.requestApi.deleteRequestType(requestType.id), () =>
      this.requestTypesSignal.update(types => types.filter(type => type.id !== requestType.id)),
      'Failed to delete request type');
    return true;
  }

  /**
   * Clears the last error.
   *
   * @author Diego Alonso Diaz Villalba
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Adds a history entry, changes the status and saves the request.
   *
   * @param request - A copy of the request to change.
   * @param newStatus - The new status.
   * @param actorId - The employee who makes the change.
   * @param comment - The comment or reason, or null.
   * @param afterSave - Optional action to run once the request is saved.
   * @author Diego Alonso Diaz Villalba
   */
  private changeStatus(request: Request, newStatus: RequestStatus, actorId: number, comment: string | null, afterSave?: () => void): void {
    const history = request.history;
    history.push(new RequestHistory({
      id: history.reduce((max, entry) => Math.max(max, entry.id), 0) + 1,
      previousStatus: request.status,
      newStatus,
      actorId,
      comment,
      occurredAt: new Date().toISOString()
    }));
    request.history = history;
    request.status = newStatus;
    this.persist(this.requestApi.updateRequest(request), updated => {
      this.requestsSignal.update(requests => requests.map(current => current.id === updated.id ? updated : current));
      afterSave?.();
    }, 'Failed to update request');
  }

  /**
   * Asks Benefits to debit the vacation days of an approved vacation request (RequestApproved).
   *
   * @param request - The approved request.
   * @author Diego Alonso Diaz Villalba
   */
  private notifyBenefitsOfApproval(request: Request): void {
    const requestType = this.requestTypesSignal().find(type => type.id === request.requestTypeId);
    if (!requestType?.deductsVacationDays() || request.requestedDays() === 0) return;
    this.benefitsAcl.debitVacationDays(request.requesterId, request.requestedDays(), request.id);
  }

  /**
   * Stores the result of a validation in the error signal.
   *
   * @param error - The error found, or null.
   * @returns True if there is no error, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  private passes(error: RequestError | null): boolean {
    this.errorSignal.set(error);
    return error === null;
  }

  /**
   * Stores an error without parameters.
   *
   * @param key - The translation key of the error.
   * @returns Always false
   * @author Diego Alonso Diaz Villalba
   */
  private fail(key: string): false {
    this.errorSignal.set({ key, params: {} });
    return false;
  }

  /**
   * Runs a write operation with retries, updating the loading and error signals.
   *
   * @param operation - The API call.
   * @param onSuccess - Updates the state with the result.
   * @param fallback - Message used when the error has none.
   * @author Diego Alonso Diaz Villalba
   */
  private persist<T>(operation: Observable<T>, onSuccess: (result: T) => void, fallback: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    operation.pipe(retry(2)).subscribe({
      next: result => {
        onSuccess(result);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.toError(error, fallback));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all the requests.
   *
   * @author Diego Alonso Diaz Villalba
   */
  private loadRequests(): void {
    this.loadingSignal.set(true);
    this.requestApi.getRequests().pipe(takeUntilDestroyed()).subscribe({
      next: requests => {
        this.requestsSignal.set(requests);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.toError(error, 'Failed to load requests'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all the request types.
   *
   * @author Diego Alonso Diaz Villalba
   */
  private loadRequestTypes(): void {
    this.requestApi.getRequestTypes().pipe(takeUntilDestroyed()).subscribe({
      next: types => this.requestTypesSignal.set(types),
      error: error => this.errorSignal.set(this.toError(error, 'Failed to load request types'))
    });
  }

  /**
   * Loads the employees through the WorkspaceAcl.
   *
   * @author Diego Alonso Diaz Villalba
   */
  private loadRequesters(): void {
    this.workspaceAcl.getRequesters().pipe(takeUntilDestroyed()).subscribe({
      next: requesters => this.requestersSignal.set(requesters),
      error: error => this.errorSignal.set(this.toError(error, 'Failed to load employees'))
    });
  }

  /**
   * Creates a copy of a request, so the state is changed only after the API confirms.
   *
   * @param request - The request to copy.
   * @returns The copy, with the same request type
   * @author Diego Alonso Diaz Villalba
   */
  private copyRequest(request: Request): Request {
    const assembler = new RequestAssembler();
    const copy = assembler.toEntityFromResource(assembler.toResourceFromEntity(request));
    copy.requestType = request.requestType;
    return copy;
  }

  /**
   * Creates a copy of a request type.
   *
   * @param requestType - The request type to copy.
   * @returns The copy
   * @author Diego Alonso Diaz Villalba
   */
  private copyRequestType(requestType: RequestType): RequestType {
    const assembler = new RequestTypeAssembler();
    return assembler.toEntityFromResource(assembler.toResourceFromEntity(requestType));
  }

  /**
   * Converts an error of the API to a RequestError.
   *
   * @param error - The error received.
   * @param fallback - Message used when the error is not an Error.
   * @returns The RequestError
   * @author Diego Alonso Diaz Villalba
   */
  private toError(error: unknown, fallback: string): RequestError {
    return { key: error instanceof Error ? error.message : fallback, params: {} };
  }
}
