import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';
import {CurrentEmployeeStore} from '../../shared/application/current-employee.store';
import {RequestApi} from '../infrastructure/request-api';
import {WorkspaceAcl} from '../infrastructure/workspace-acl';
import {BenefitsAcl} from '../infrastructure/benefits-acl';
import {ResolveRequestResource} from '../infrastructure/request-command-resources';
import {
  ApproverType,
  countCalendarDays,
  Request,
  RequestAttachment,
  RequestFieldValue
} from '../domain/model/request.entity';
import {RequestType} from '../domain/model/request-type.entity';
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
 * computed signals. The Flowboard Web Service is the source of truth: it routes each request, changes
 * its status, adds the history entries and applies the business rules. The store only checks the form
 * before sending it (so the employee gets quick feedback), calls the action of the web service and
 * replaces the request with the answer. When the web service refuses an action, its reason is kept in
 * the error signal so the view can show it.
 *
 * Every write method returns false when the local check fails, and true when the call was sent; the
 * optional onSuccess callback runs only after the web service confirms, so dialogs close and forms
 * navigate only when the change was really saved. Workspace and Benefits are reached only through the
 * WorkspaceAcl and the BenefitsAcl.
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
   * Shows in the form who will resolve a request of the requester.
   *
   * @remarks Only a preview: the web service decides the approver with the same rule when the request is
   * submitted (the direct manager when the employee has an active one; otherwise Human Resources).
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
   * Counts the calendar days requested in a form.
   *
   * @param requestType - The selected request type, or null.
   * @param period - The period entered.
   * @returns The calendar days, or 0 when the type has no period, is measured in hours or the period is invalid
   * @author Diego Alonso Diaz Villalba
   */
  requestedDays(requestType: RequestType | null, period: RequestPeriodValues): number {
    if (!requestType?.hasPeriod() || requestType.isMeasuredInHours() || !period.startDate || !period.endDate) return 0;
    return period.endDate < period.startDate ? 0 : countCalendarDays(period.startDate, period.endDate);
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
      // Benefits still uses the fake API: the balance only blocks the request when it is known
      const balance = this.myVacationBalance();
      const days = this.requestedDays(requestType, period);
      if (balance && !balance.hasEnough(days)) {
        return { key: 'request-error.insufficient-balance', params: { available: balance.availableDays, requested: days } };
      }
    }
    return null;
  }

  /**
   * Submits a new request of the employee in session (US29).
   * The web service routes it to the direct manager or to Human Resources and it starts 'IN_PROGRESS'.
   *
   * @param requestType - The request type.
   * @param fieldValues - The values entered.
   * @param attachments - The attached files.
   * @param onSuccess - Runs when the web service saved the request.
   * @returns True if the request passed the local checks and was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  submitRequest(requestType: RequestType, fieldValues: RequestFieldValue[], attachments: RequestAttachment[],
                onSuccess?: () => void): boolean {
    const requester = this.currentEmployee();
    if (!requester) return this.fail('request-error.requester-not-found');
    if (!this.passes(this.checkBeforeSubmit(requestType, fieldValues, attachments))) return false;
    const period = this.periodOf(requestType, fieldValues);
    this.persist(this.requestApi.submitRequest({
      requesterId: requester.id,
      requestTypeId: requestType.id,
      ...period,
      fieldValues: this.nonEmpty(fieldValues),
      attachments
    }), created => {
      this.requestsSignal.update(requests => [...requests, created]);
      onSuccess?.();
    });
    return true;
  }

  /**
   * Sends again a request that was returned for review, with the corrected period, values and attachments.
   * It goes back to 'IN_PROGRESS'.
   *
   * @param request - The request under review.
   * @param requestType - The request type.
   * @param fieldValues - The corrected values.
   * @param attachments - The attached files.
   * @param onSuccess - Runs when the web service saved the change.
   * @returns True if it was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  resubmitRequest(request: Request, requestType: RequestType, fieldValues: RequestFieldValue[],
                  attachments: RequestAttachment[], onSuccess?: () => void): boolean {
    const actor = this.currentEmployee();
    if (!actor || !request.isUnderReview() || !request.isOwnedBy(actor.id)) return this.fail('request-error.not-under-review');
    if (!this.passes(this.checkBeforeSubmit(requestType, fieldValues, attachments))) return false;
    this.persist(this.requestApi.resubmitRequest(request.id, {
      actorId: actor.id,
      ...this.periodOf(requestType, fieldValues),
      fieldValues: this.nonEmpty(fieldValues),
      attachments,
      comment: null
    }), updated => this.replaceRequest(updated, onSuccess));
    return true;
  }

  /**
   * Checks whether the employee in session can resolve a request.
   *
   * @remarks A pending request is resolved by the approver the web service assigned: Human Resources
   * staff resolve the ones routed to 'HR_STAFF', and a direct manager the ones assigned to them. The
   * requests assigned to another manager are shown read only. Nobody resolves their own request.
   * @param request - The request.
   * @returns True if the employee in session is the approver of a pending request, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  canResolve(request: Request): boolean {
    const employeeId = this.currentEmployeeId();
    if (!request.isPending() || request.isOwnedBy(employeeId)) return false;
    return request.isRoutedToHr() ? !!this.currentEmployee()?.hrStaff : request.approverId === employeeId;
  }

  /**
   * Approves a pending request (US31). When Benefits is in the web service, it debits the vacation days
   * by listening to the RequestApproved event, so the client does not do it.
   *
   * @param request - The request to approve.
   * @param comment - Optional comment of the approver.
   * @param onSuccess - Runs when the web service saved the change.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  approveRequest(request: Request, comment: string | null, onSuccess?: () => void): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    this.persist(this.requestApi.approveRequest(request.id, this.resolution(comment)),
      updated => this.replaceRequest(updated, onSuccess));
    return true;
  }

  /**
   * Rejects a pending request (US31). The reason is required.
   *
   * @param request - The request to reject.
   * @param reason - The reason shown to the employee.
   * @param onSuccess - Runs when the web service saved the change.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  rejectRequest(request: Request, reason: string, onSuccess?: () => void): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    if (!reason.trim()) return this.fail('request-error.reason-required');
    this.persist(this.requestApi.rejectRequest(request.id, this.resolution(reason)),
      updated => this.replaceRequest(updated, onSuccess));
    return true;
  }

  /**
   * Returns a pending request to the employee to complete it (status 'UNDER_REVIEW'). The comment is required.
   *
   * @param request - The request to return.
   * @param comment - What the employee must complete.
   * @param onSuccess - Runs when the web service saved the change.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  returnRequestForReview(request: Request, comment: string, onSuccess?: () => void): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    if (!comment.trim()) return this.fail('request-error.comment-required');
    this.persist(this.requestApi.returnRequestForReview(request.id, this.resolution(comment)),
      updated => this.replaceRequest(updated, onSuccess));
    return true;
  }

  /**
   * Cancels a request of the employee in session that is not resolved yet (US33).
   *
   * @param request - The request to cancel.
   * @param onSuccess - Runs when the web service saved the change.
   * @returns True if the change was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  cancelRequest(request: Request, onSuccess?: () => void): boolean {
    if (!request.canBeCancelled()) return this.fail('request-error.already-resolved');
    if (!request.isOwnedBy(this.currentEmployeeId())) return this.fail('request-error.not-owner');
    this.persist(this.requestApi.cancelRequest(request.id, this.resolution(null)),
      updated => this.replaceRequest(updated, onSuccess));
    return true;
  }

  /**
   * Adds a request type (US28). The name must be unique.
   *
   * @param requestType - The request type to add.
   * @param onSuccess - Runs when the web service saved the type.
   * @returns True if it was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  addRequestType(requestType: RequestType, onSuccess?: () => void): boolean {
    if (this.isRequestTypeNameTaken(requestType.name, null)) return this.fail('request-error.type-duplicated');
    this.persist(this.requestApi.createRequestType(requestType), created => {
      this.requestTypesSignal.update(types => [...types, created]);
      onSuccess?.();
    });
    return true;
  }

  /**
   * Updates a request type, including the fields of its form. The name must be unique.
   *
   * @remarks If the type already has requests, the web service does not allow removing fields nor
   * changing their data type; its reason is shown in the error signal.
   * @param requestType - The request type with its new data.
   * @param onSuccess - Runs when the web service saved the type.
   * @returns True if it was sent, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  updateRequestType(requestType: RequestType, onSuccess?: () => void): boolean {
    if (this.isRequestTypeNameTaken(requestType.name, requestType.id)) return this.fail('request-error.type-duplicated');
    this.persist(this.requestApi.updateRequestType(requestType), updated => {
      this.replaceRequestType(updated);
      onSuccess?.();
    });
    return true;
  }

  /**
   * Activates or deactivates a request type (US27).
   *
   * @param requestType - The request type.
   * @author Diego Alonso Diaz Villalba
   */
  toggleRequestTypeStatus(requestType: RequestType): void {
    const operation = requestType.active
      ? this.requestApi.deactivateRequestType(requestType.id)
      : this.requestApi.activateRequestType(requestType.id);
    this.persist(operation, updated => this.replaceRequestType(updated));
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
      this.requestTypesSignal.update(types => types.filter(type => type.id !== requestType.id)));
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
   * Reads the period that is sent to the web service.
   *
   * @param requestType - The request type.
   * @param fieldValues - The values entered.
   * @returns The period, or every value null when the type has no period
   * @author Diego Alonso Diaz Villalba
   */
  private periodOf(requestType: RequestType, fieldValues: RequestFieldValue[]): RequestPeriodValues {
    return requestType.hasPeriod()
      ? this.periodFrom(fieldValues)
      : { startDate: null, endDate: null, startTime: null, endTime: null };
  }

  /**
   * Keeps only the values that were filled in; the web service does not store empty values.
   *
   * @param fieldValues - The values entered.
   * @returns The values with text
   * @author Diego Alonso Diaz Villalba
   */
  private nonEmpty(fieldValues: RequestFieldValue[]): RequestFieldValue[] {
    return fieldValues
      .filter(value => value.value?.trim())
      .map(value => ({ key: value.key, value: value.value.trim() }));
  }

  /**
   * Builds the body of an approve, reject, return or cancel action for the employee in session.
   *
   * @param comment - The comment or reason, or null.
   * @returns The body of the action
   * @author Diego Alonso Diaz Villalba
   */
  private resolution(comment: string | null): ResolveRequestResource {
    return { actorId: this.currentEmployeeId(), comment: comment?.trim() || null };
  }

  /**
   * Replaces a request with the version returned by the web service and runs the callback.
   *
   * @param updated - The request returned by the web service.
   * @param onSuccess - Optional callback of the view.
   * @author Diego Alonso Diaz Villalba
   */
  private replaceRequest(updated: Request, onSuccess?: () => void): void {
    this.requestsSignal.update(requests => requests.map(current => current.id === updated.id ? updated : current));
    onSuccess?.();
  }

  /**
   * Replaces a request type with the version returned by the web service.
   *
   * @param updated - The request type returned by the web service.
   * @author Diego Alonso Diaz Villalba
   */
  private replaceRequestType(updated: RequestType): void {
    this.requestTypesSignal.update(types => types.map(type => type.id === updated.id ? updated : type));
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
   * Runs a write operation, updating the loading and error signals.
   *
   * @remarks It does not retry: the actions are not idempotent (retrying a submit could create the
   * request twice) and a refused action would be refused again.
   * @param operation - The API call.
   * @param onSuccess - Updates the state with the result.
   * @author Diego Alonso Diaz Villalba
   */
  private persist<T>(operation: Observable<T>, onSuccess: (result: T) => void): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    operation.subscribe({
      next: result => {
        onSuccess(result);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.toError(error, 'request-error.unexpected'));
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
   * Converts an error of the API to a RequestError.
   *
   * @remarks The message of the error is the reason sent by the web service (see handleWebServiceError).
   * @param error - The error received.
   * @param fallback - Translation key used when the error is not an Error.
   * @returns The RequestError
   * @author Diego Alonso Diaz Villalba
   */
  private toError(error: unknown, fallback: string): RequestError {
    return { key: error instanceof Error ? error.message : fallback, params: {} };
  }
}
