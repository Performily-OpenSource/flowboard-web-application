import {Component, computed, effect, inject, signal, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {RequestStore} from '../../../application/request.store';
import {BalanceDeduction, RequestType} from '../../../domain/model/request-type.entity';
import {
  FIELD_DATA_TYPES,
  FIELD_KEY_PATTERN,
  FieldDataType,
  PERIOD_FIELD_KEYS,
  RequestField
} from '../../../domain/model/request-field.entity';
import {DynamicField} from '../../components/dynamic-field/dynamic-field';

interface FieldDraft {
  key: string;
  label: string;
  dataType: FieldDataType;
  required: boolean;
}

@Component({
  selector: 'app-request-type-form',
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatIcon, MatSlideToggle, TranslatePipe, DynamicField],
  templateUrl: './request-type-form.html',
  styleUrl: './request-type-form.css',
})
export class RequestTypeForm extends BaseForm {
  readonly store = inject(RequestStore);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly dataTypes = FIELD_DATA_TYPES;
  readonly periodKeys = PERIOD_FIELD_KEYS;
  readonly typeId = Number(this.route.snapshot.paramMap.get('id')) || null;
  readonly isEdit = this.typeId !== null;
  readonly existingType = computed(() => this.typeId ? this.store.requestTypes().find(type => type.id === this.typeId) ?? null : null);

  readonly form = this.fb.group({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    description: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(250)] }),
    requiresAttachment: new FormControl<boolean>(false, { nonNullable: true }),
    deductsBalance: new FormControl<boolean>(false, { nonNullable: true }),
    balanceDeduction: new FormControl<BalanceDeduction>('VACATION_DAYS', { nonNullable: true })
  });

  readonly newFieldForm = this.fb.group({
    label: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    key: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(FIELD_KEY_PATTERN)] }),
    dataType: new FormControl<FieldDataType>('TEXT', { nonNullable: true }),
    required: new FormControl<boolean>(true, { nonNullable: true })
  });

  readonly fields = signal<FieldDraft[]>([]);
  readonly addingField = signal(false);
  readonly submitted = signal(false);
  readonly localError = signal<{ key: string; params: Record<string, unknown> } | null>(null);
  private keyEditedByHand = false;
  private initialized = false;

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly requiresAttachment = computed(() => !!this.formValue().requiresAttachment);
  readonly deductsBalance = computed(() => !!this.formValue().deductsBalance);

  readonly preview = computed(() => this.fields().map((draft, index) => ({
    field: new RequestField({ id: index + 1, key: draft.key, label: draft.label, dataType: draft.dataType, required: draft.required, displayOrder: index + 1 }),
    control: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true })
  })));

  readonly nameTaken = computed(() => {
    const name = this.formValue().name ?? '';
    return !!name.trim() && this.store.isRequestTypeNameTaken(name, this.typeId);
  });

  constructor() {
    super();
    this.store.clearError();

    this.newFieldForm.controls.label.valueChanges.subscribe(label => {
      if (!this.keyEditedByHand) this.newFieldForm.controls.key.setValue(this.toKey(label), { emitEvent: false });
    });

    effect(() => {
      const type = this.existingType();
      untracked(() => {
        if (this.initialized || !type) return;
        this.initialized = true;
        this.form.setValue({
          name: type.name,
          description: type.description,
          requiresAttachment: type.requiresAttachment,
          deductsBalance: type.deductsBalance(),
          balanceDeduction: type.deductsBalance() ? type.balanceDeduction : 'VACATION_DAYS'
        });
        this.fields.set(type.fields.map(field => ({
          key: field.key, label: field.label, dataType: field.dataType, required: field.required
        })));
      });
    });
  }

  startNewField() {
    this.newFieldForm.reset({ label: '', key: '', dataType: 'TEXT', required: true });
    this.keyEditedByHand = false;
    this.addingField.set(true);
  }

  onKeyEdited() {
    this.keyEditedByHand = true;
  }

  get newKeyTaken(): boolean {
    const key = this.newFieldForm.controls.key.value;
    return this.fields().some(field => field.key === key);
  }

  addField() {
    this.newFieldForm.markAllAsTouched();
    if (this.newFieldForm.invalid || this.newKeyTaken) return;
    const { label, key, dataType, required } = this.newFieldForm.getRawValue();
    this.fields.update(fields => [...fields, { label: label.trim(), key, dataType, required }]);
    this.addingField.set(false);
  }

  removeField(index: number) {
    this.fields.update(fields => fields.filter((_, current) => current !== index));
  }

  moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    this.fields.update(fields => {
      if (target < 0 || target >= fields.length) return fields;
      const copy = [...fields];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  toggleRequired(index: number) {
    this.fields.update(fields => fields.map((field, current) => current === index ? { ...field, required: !field.required } : field));
  }

  save() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.localError.set(null);
    if (this.form.invalid || this.nameTaken()) return;
    if (this.fields().length === 0) {
      this.localError.set({ key: 'request-type-form.fields-required', params: {} });
      return;
    }
    const value = this.form.getRawValue();
    const existing = this.existingType();
    const requestType = new RequestType({
      id: existing?.id ?? 0,
      name: value.name.trim(),
      description: value.description.trim(),
      requiresAttachment: value.requiresAttachment,
      balanceDeduction: value.deductsBalance ? value.balanceDeduction : 'NONE',
      active: existing?.active ?? true,
      fields: this.fields().map((draft, index) => new RequestField({
        id: index + 1, key: draft.key, label: draft.label, dataType: draft.dataType, required: draft.required, displayOrder: index + 1
      }))
    });
    const saved = existing ? this.store.updateRequestType(requestType) : this.store.addRequestType(requestType);
    if (saved) this.router.navigate(['/requests/types']).then();
  }

  private toKey(label: string): string {
    const words = label.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
    let key = words.map((word, index) => index === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('').slice(0, 50);
    if (key && !/^[a-z]/.test(key)) key = `field${key}`.slice(0, 50);
    return key;
  }
}
