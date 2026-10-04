import {Component, computed, DestroyRef, effect, inject, signal, untracked} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {RequestStore} from '../../../application/request.store';
import {RequestAttachment, RequestFieldValue} from '../../../domain/model/request.entity';
import {RequestType} from '../../../domain/model/request-type.entity';
import {RequestField} from '../../../domain/model/request-field.entity';
import {DynamicField} from '../../components/dynamic-field/dynamic-field';
import {VacationBalanceCard} from '../../components/vacation-balance-card/vacation-balance-card';
import {ApproverCard} from '../../components/approver-card/approver-card';
import {FileSizePipe} from '../../pipes/file-size-pipe';

/** File types that can be attached: PDF, JPG and PNG. */
const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
/** Maximum size of an attached file: 5 MB. */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Form with one text control per field of the request type. */
type FieldsForm = FormGroup<Record<string, FormControl<string>>>;

/**
 * View to submit a new request (US29, US30) or to complete one returned for review.
 * Builds the form from the fields of the selected request type, calculates the working days,
 * shows the vacation balance and the approver, and handles the attachments.
 *
 * @author Diego Alonso Diaz Villalba
 */
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
    FileSizePipe
  ],
  templateUrl: './request-form.html',
  styleUrl: './request-form.css',
})
export class RequestForm extends BaseForm {
  readonly store = inject(RequestStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private valueChanges?: Subscription;
  private initialized = false;

  /** Request being completed, taken from the route, or null for a new one. */
  readonly requestId = Number(this.route.snapshot.paramMap.get('id')) || null;
  /** Whether the view completes a request returned for review. */
  readonly isCompleting = this.requestId !== null;
  /** The request being completed, or null. */
  readonly existingRequest = computed(() =>
    this.requestId ? this.store.myRequests().find(request => request.id === this.requestId) ?? null : null);

  /** Select of the request type; disabled while completing a request. */
  readonly typeControl = new FormControl<number | null>(null);
  /** Identifier of the selected request type. */
  readonly selectedTypeId = signal<number | null>(null);
  /** The selected request type, or null. */
  readonly requestType = computed<RequestType | null>(() =>
    this.store.requestTypes().find(type => type.id === this.selectedTypeId()) ?? null);

  /** Form of the fields of the selected type, rebuilt when the type changes. */
  readonly form = signal<FieldsForm>(new FormGroup<Record<string, FormControl<string>>>({}));
  /** Current values of the form, as a signal. */
  readonly values = signal<Record<string, string>>({});
  /** Files attached to the request. */
  readonly attachments = signal<RequestAttachment[]>([]);
  /** Whether the employee already tried to submit. */
  readonly submitted = signal(false);
  /** Translation key of the last file error, or null. */
  readonly fileError = signal<string | null>(null);

  /** Fields of the period (dates and times). */
  readonly periodFields = computed(() => this.requestType()?.fields.filter(field => field.isPeriodField()) ?? []);
  /** Fields that are not part of the period. */
  readonly otherFields = computed(() => this.requestType()?.fields.filter(field => !field.isPeriodField()) ?? []);

  /** Values of the fields of the selected type. */
  readonly fieldValues = computed<RequestFieldValue[]>(() =>
    (this.requestType()?.fields ?? []).map(field => ({ key: field.key, value: this.values()[field.key] ?? '' })));

  /** Period read from the values. */
  readonly period = computed(() => this.store.periodFrom(this.fieldValues()));
  /** Error of the period, or null. */
  readonly periodError = computed(() => this.store.periodError(this.period()));
  /** Working days requested. */
  readonly requestedDays = computed(() => this.store.requestedDays(this.requestType(), this.period()));

  /** Whether to show the calculated days: the type has a period measured in days. */
  readonly showsCalculatedDays = computed(() => {
    const type = this.requestType();
    return !!type && type.hasPeriod() && !type.isMeasuredInHours();
  });

  /** Vacation balance of the employee in session. */
  readonly balance = this.store.myVacationBalance;

  /** Whether a vacation request asks for more days than available. */
  readonly insufficientBalance = computed(() => {
    const balance = this.balance();
    return !!this.requestType()?.deductsVacationDays() && !!balance && !balance.hasEnough(this.requestedDays());
  });

  /** Manager who will resolve the request, or null for Human Resources. */
  readonly manager = computed(() => {
    const { approverId } = this.store.resolveApprover(this.store.currentEmployee());
    return this.store.getRequester(approverId);
  });

  /**
   * Creates the view, rebuilds the form when the type changes and loads the first active type,
   * or the data of the request being completed.
   *
   * @author Diego Alonso Diaz Villalba
   */
  constructor() {
    super();
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

  /**
   * Checks whether a field uses half of the form width.
   *
   * @param field - The field.
   * @returns True for every data type except text, false otherwise
   * @author Diego Alonso Diaz Villalba
   */
  isHalfWidth(field: RequestField): boolean {
    return field.dataType !== 'TEXT';
  }

  /**
   * Attaches the selected file after checking its type and size.
   *
   * @param event - The change event of the file input.
   * @author Diego Alonso Diaz Villalba
   */
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

  /**
   * Removes an attached file.
   *
   * @param file - The file to remove.
   * @author Diego Alonso Diaz Villalba
   */
  removeAttachment(file: RequestAttachment) {
    this.attachments.update(files => files.filter(current => current !== file));
  }

  /**
   * Submits the request, or sends it again when completing one, and goes back to "My requests".
   *
   * @author Diego Alonso Diaz Villalba
   */
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

  /**
   * Builds the form of a request type, with one control per field.
   *
   * @param type - The request type.
   * @param initialValues - Values to load, by field key.
   * @author Diego Alonso Diaz Villalba
   */
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
