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

export interface RequestError {
  key: string;
  params: Record<string, unknown>;
}

export interface RequestPeriodValues {
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
}

@Injectable({providedIn: 'root'})
export class RequestStore {
  private readonly requestsSignal = signal<Request[]>([]);
  private readonly requestTypesSignal = signal<RequestType[]>([]);
  private readonly requestersSignal = signal<Requester[]>([]);

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<RequestError | null>(null);
  readonly error = this.errorSignal.asReadonly();

  /**
   * Employee in session, shared by every bounded context. Until IAM exists it starts with a
   * Human Resources employee (environment.defaultActingEmployeeId).
   */
  private readonly currentEmployeeStore = inject(CurrentEmployeeStore);
  readonly currentEmployeeId = this.currentEmployeeStore.employeeId;

  readonly requesters = this.requestersSignal.asReadonly();
  readonly currentEmployee = computed(() => this.getRequester(this.currentEmployeeId()));

  readonly requestTypes = computed(() => [...this.requestTypesSignal()].sort((a, b) => a.id - b.id));
  readonly activeRequestTypes = computed(() => this.requestTypes().filter(type => type.active));

  readonly requests = computed(() => {
    const types = this.requestTypesSignal();
    return this.requestsSignal()
      .map(request => {
        request.requestType = types.find(type => type.id === request.requestTypeId) ?? null;
        return request;
      })
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  });

  readonly myRequests = computed(() => this.requests().filter(request => request.isOwnedBy(this.currentEmployeeId())));

  /** Human Resources sees the requests of every other employee. */
  readonly inboxRequests = computed(() => this.requests().filter(request => !request.isOwnedBy(this.currentEmployeeId())));

  readonly myVacationBalance = computed(() => this.getVacationBalance(this.currentEmployeeId()));

  constructor(private requestApi: RequestApi, private workspaceAcl: WorkspaceAcl, private benefitsAcl: BenefitsAcl) {
    this.loadRequesters();
    this.loadRequestTypes();
    this.loadRequests();
  }

  getRequestTypeById(id: number): Signal<RequestType | undefined> {
    return computed(() => id ? this.requestTypes().find(type => type.id === id) : undefined);
  }

  getRequester(id: number | null): Requester | null {
    return id === null ? null : this.requestersSignal().find(requester => requester.id === id) ?? null;
  }

  /** Requests of one employee, newest first. Used by the employee file of Workspace. */
  requestsOf(employeeId: number): Request[] {
    return this.requests().filter(request => request.isOwnedBy(employeeId));
  }

  getVacationBalance(employeeId: number): VacationBalance | null {
    return this.benefitsAcl.vacationBalances().find(balance => balance.employeeId === employeeId) ?? null;
  }

  resolveApprover(requester: Requester | null): { approverType: ApproverType; approverId: number | null } {
    const manager = this.getRequester(requester?.directManagerId ?? null);
    return manager && manager.active
      ? { approverType: 'DIRECT_MANAGER', approverId: manager.id }
      : { approverType: 'HR_STAFF', approverId: null };
  }

  approverName(request: Request): string | null {
    return request.isRoutedToHr() ? null : this.getRequester(request.approverId)?.fullName ?? null;
  }

  countRequestsOfType(requestTypeId: number): number {
    return this.requestsSignal().filter(request => request.requestTypeId === requestTypeId).length;
  }

  isRequestTypeNameTaken(name: string, excludedId: number | null): boolean {
    const normalized = name.trim().toLowerCase();
    return this.requestTypesSignal().some(type => type.id !== excludedId && type.name.trim().toLowerCase() === normalized);
  }

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

  periodError(period: RequestPeriodValues): RequestError | null {
    if (period.startDate && period.endDate && period.endDate < period.startDate) {
      return { key: 'request-error.period-end-before-start', params: {} };
    }
    if (period.startTime && period.endTime && period.endTime <= period.startTime) {
      return { key: 'request-error.period-end-time-before-start', params: {} };
    }
    return null;
  }

  requestedDays(requestType: RequestType | null, period: RequestPeriodValues): number {
    if (!requestType?.hasPeriod() || requestType.isMeasuredInHours() || !period.startDate || !period.endDate) return 0;
    return period.endDate < period.startDate ? 0 : countWorkingDays(period.startDate, period.endDate);
  }

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

  canResolve(request: Request): boolean {
    // Human Resources can resolve any pending request, except its own
    return request.isPending() && !request.isOwnedBy(this.currentEmployeeId());
  }

  approveRequest(request: Request, comment: string | null): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    const updated = this.copyRequest(request);
    this.changeStatus(updated, 'APPROVED', this.currentEmployeeId(), comment?.trim() || null,
      () => this.notifyBenefitsOfApproval(updated));
    return true;
  }

  rejectRequest(request: Request, reason: string): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    if (!reason.trim()) return this.fail('request-error.reason-required');
    this.changeStatus(this.copyRequest(request), 'REJECTED', this.currentEmployeeId(), reason.trim());
    return true;
  }

  returnRequestForReview(request: Request, comment: string): boolean {
    if (!this.canResolve(request)) return this.fail('request-error.not-assigned');
    if (!comment.trim()) return this.fail('request-error.comment-required');
    this.changeStatus(this.copyRequest(request), 'UNDER_REVIEW', this.currentEmployeeId(), comment.trim());
    return true;
  }

  cancelRequest(request: Request): boolean {
    if (!request.canBeCancelled()) return this.fail('request-error.already-resolved');
    if (!request.isOwnedBy(this.currentEmployeeId())) return this.fail('request-error.not-owner');
    this.changeStatus(this.copyRequest(request), 'CANCELLED', this.currentEmployeeId(), null);
    return true;
  }

  addRequestType(requestType: RequestType): boolean {
    if (this.isRequestTypeNameTaken(requestType.name, null)) return this.fail('request-error.type-duplicated');
    this.persist(this.requestApi.createRequestType(requestType), created =>
      this.requestTypesSignal.update(types => [...types, created]), 'Failed to add request type');
    return true;
  }

  updateRequestType(requestType: RequestType): boolean {
    if (this.isRequestTypeNameTaken(requestType.name, requestType.id)) return this.fail('request-error.type-duplicated');
    this.persist(this.requestApi.updateRequestType(requestType), updated =>
      this.requestTypesSignal.update(types => types.map(type => type.id === updated.id ? updated : type)),
      'Failed to update request type');
    return true;
  }

  toggleRequestTypeStatus(requestType: RequestType): void {
    const updated = this.copyRequestType(requestType);
    updated.active = !updated.active;
    this.updateRequestType(updated);
  }

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

  clearError(): void {
    this.errorSignal.set(null);
  }

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

  /** Vacation requests: once approved, Benefits debits the days (RequestApproved). */
  private notifyBenefitsOfApproval(request: Request): void {
    const requestType = this.requestTypesSignal().find(type => type.id === request.requestTypeId);
    if (!requestType?.deductsVacationDays() || request.requestedDays() === 0) return;
    this.benefitsAcl.debitVacationDays(request.requesterId, request.requestedDays(), request.id);
  }

  private passes(error: RequestError | null): boolean {
    this.errorSignal.set(error);
    return error === null;
  }

  private fail(key: string): false {
    this.errorSignal.set({ key, params: {} });
    return false;
  }

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

  private loadRequestTypes(): void {
    this.requestApi.getRequestTypes().pipe(takeUntilDestroyed()).subscribe({
      next: types => this.requestTypesSignal.set(types),
      error: error => this.errorSignal.set(this.toError(error, 'Failed to load request types'))
    });
  }

  private loadRequesters(): void {
    this.workspaceAcl.getRequesters().pipe(takeUntilDestroyed()).subscribe({
      next: requesters => this.requestersSignal.set(requesters),
      error: error => this.errorSignal.set(this.toError(error, 'Failed to load employees'))
    });
  }

  private copyRequest(request: Request): Request {
    const assembler = new RequestAssembler();
    const copy = assembler.toEntityFromResource(assembler.toResourceFromEntity(request));
    copy.requestType = request.requestType;
    return copy;
  }

  private copyRequestType(requestType: RequestType): RequestType {
    const assembler = new RequestTypeAssembler();
    return assembler.toEntityFromResource(assembler.toResourceFromEntity(requestType));
  }

  private toError(error: unknown, fallback: string): RequestError {
    return { key: error instanceof Error ? error.message : fallback, params: {} };
  }
}
