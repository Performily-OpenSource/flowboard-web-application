import {Component, computed, DestroyRef, effect, inject, signal, untracked} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestAttachment, RequestFieldValue} from '../../../domain/model/request.entity';
import {RequestType} from '../../../domain/model/request-type.entity';
import {RequestField} from '../../../domain/model/request-field.entity';
import {DynamicField} from '../../components/dynamic-field/dynamic-field';
import {VacationBalanceCard} from '../../components/vacation-balance-card/vacation-balance-card';
import {ApproverCard} from '../../components/approver-card/approver-card';
import {ActingEmployeeSelector} from '../../components/acting-employee-selector/acting-employee-selector';
import {FileSizePipe} from '../../pipes/file-size-pipe';

const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type FieldsForm = FormGroup<Record<string, FormControl<string>>>;

@Component({
  selector: 'app-request-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatIcon,
    MatProgressBar,
    TranslatePipe,
    DynamicField,
    VacationBalanceCard,
    ApproverCard,
    ActingEmployeeSelector,
    FileSizePipe
  ],
  templateUrl: './request-form.html',
  styleUrl: './request-form.css',
})
export class RequestForm {
  readonly store = inject(RequestStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private valueChanges?: Subscription;
  private initialized = false;

  readonly requestId = Number(this.route.snapshot.paramMap.get('id')) || null;
  readonly isCompleting = this.requestId !== null;
  readonly existingRequest = computed(() =>
    this.requestId ? this.store.myRequests().find(request => request.id === this.requestId) ?? null : null);

  readonly typeControl = new FormControl<number | null>(null);
  readonly selectedTypeId = signal<number | null>(null);
  readonly requestType = computed<RequestType | null>(() =>
    this.store.requestTypes().find(type => type.id === this.selectedTypeId()) ?? null);

  readonly form = signal<FieldsForm>(new FormGroup<Record<string, FormControl<string>>>({}));
  readonly values = signal<Record<string, string>>({});
  readonly attachments = signal<RequestAttachment[]>([]);
  readonly submitted = signal(false);
  readonly fileError = signal<string | null>(null);

  readonly periodFields = computed(() => this.requestType()?.fields.filter(field => field.isPeriodField()) ?? []);
  readonly otherFields = computed(() => this.requestType()?.fields.filter(field => !field.isPeriodField()) ?? []);

  readonly fieldValues = computed<RequestFieldValue[]>(() =>
    (this.requestType()?.fields ?? []).map(field => ({ key: field.key, value: this.values()[field.key] ?? '' })));

  readonly period = computed(() => this.store.periodFrom(this.fieldValues()));
  readonly periodError = computed(() => this.store.periodError(this.period()));
  readonly requestedDays = computed(() => this.store.requestedDays(this.requestType(), this.period()));

  readonly showsCalculatedDays = computed(() => {
    const type = this.requestType();
    return !!type && type.hasPeriod() && !type.isMeasuredInHours();
  });

  readonly balance = this.store.myVacationBalance;

  readonly insufficientBalance = computed(() => {
    const balance = this.balance();
    return !!this.requestType()?.deductsVacationDays() && !!balance && !balance.hasEnough(this.requestedDays());
  });

  readonly manager = computed(() => {
    const { approverId } = this.store.resolveApprover(this.store.actingEmployee());
    return this.store.getRequester(approverId);
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.valueChanges?.unsubscribe());
    this.store.clearError();

    this.typeControl.valueChanges.subscribe(typeId => {
      const type = this.store.requestTypes().find(current => current.id === typeId) ?? null;
      this.selectedTypeId.set(typeId);
      this.attachments.set([]);
      this.submitted.set(false);
      this.store.clearError();
      if (type) this.buildForm(type, {});
    });

    effect(() => {
      const types = this.store.activeRequestTypes();
      const existing = this.existingRequest();
      untracked(() => {
        if (this.initialized) return;
        if (this.isCompleting && existing) {
          const type = this.store.requestTypes().find(current => current.id === existing.requestTypeId);
          if (!type) return;
          this.initialized = true;
          this.selectedTypeId.set(type.id);
          this.typeControl.setValue(type.id, { emitEvent: false });
          this.typeControl.disable({ emitEvent: false });
          this.attachments.set([...existing.attachments]);
          this.buildForm(type, Object.fromEntries(existing.fieldValues.map(value => [value.key, value.value])));
        } else if (!this.isCompleting && types.length > 0) {
          this.initialized = true;
          this.typeControl.setValue(types[0].id);
        }
      });
    });
  }

  isHalfWidth(field: RequestField): boolean {
    return field.dataType !== 'TEXT';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      this.fileError.set('request-form.file-type');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.fileError.set('request-form.file-size');
      return;
    }
    this.fileError.set(null);
    this.attachments.update(files => [...files, {
      fileName: file.name,
      contentType: file.type,
      sizeInBytes: file.size,
      storageUrl: `/files/requests/${Date.now()}-${file.name}`
    }]);
  }

  removeAttachment(file: RequestAttachment) {
    this.attachments.update(files => files.filter(current => current !== file));
  }

  submit() {
    const type = this.requestType();
    if (!type) return;
    this.submitted.set(true);
    this.form().markAllAsTouched();
    const existing = this.existingRequest();
    const sent = existing
      ? this.store.resubmitRequest(existing, type, this.fieldValues(), this.attachments())
      : this.store.submitRequest(type, this.fieldValues(), this.attachments());
    if (sent) this.router.navigate(['/requests/my-requests']).then();
  }

  private buildForm(type: RequestType, initialValues: Record<string, string>) {
    const controls: Record<string, FormControl<string>> = {};
    type.fields.forEach(field => {
      controls[field.key] = new FormControl<string>(initialValues[field.key] ?? '', {
        nonNullable: true,
        validators: field.required ? [Validators.required] : []
      });
    });
    const form = new FormGroup(controls);
    this.valueChanges?.unsubscribe();
    this.valueChanges = form.valueChanges.subscribe(() => this.values.set(form.getRawValue()));
    this.form.set(form);
    this.values.set(form.getRawValue());
  }
}
