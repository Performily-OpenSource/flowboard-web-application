import {Component, computed, effect, inject, signal, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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

/**
 * Field being configured in the form, before the request type is saved.
 *
 * @author Diego Alonso Diaz Villalba
 */
interface FieldDraft {
  /** Key of the field. */
  key: string;
  /** Label of the field. */
  label: string;
  /** Data type of the field. */
  dataType: FieldDataType;
  /** Whether the field is required. */
  required: boolean;
}

/**
 * View to create or edit a request type (US28): name, description, attachment rule, balance
 * deduction and the list of fields, with a preview of the form the employee will see.
 *
 * @author Diego Alonso Diaz Villalba
 */
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

  /** Data types offered for a new field. */
  readonly dataTypes = FIELD_DATA_TYPES;
  /** Keys of the period fields. */
  readonly periodKeys = PERIOD_FIELD_KEYS;
  /** Request type being edited, taken from the route, or null for a new one. */
  readonly typeId = Number(this.route.snapshot.paramMap.get('id')) || null;
  /** Whether the view edits an existing type. */
  readonly isEdit = this.typeId !== null;
  /** The request type being edited, or null. */
  readonly existingType = computed(() => this.typeId ? this.store.requestTypes().find(type => type.id === this.typeId) ?? null : null);

  /** Form with the data of the request type. */
  readonly form = this.fb.group({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    description: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(250)] }),
    requiresAttachment: new FormControl<boolean>(false, { nonNullable: true }),
    deductsBalance: new FormControl<boolean>(false, { nonNullable: true }),
    balanceDeduction: new FormControl<BalanceDeduction>('VACATION_DAYS', { nonNullable: true })
  });

  /** Form of the field being added. */
  readonly newFieldForm = this.fb.group({
    label: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    key: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(FIELD_KEY_PATTERN)] }),
    dataType: new FormControl<FieldDataType>('TEXT', { nonNullable: true }),
    required: new FormControl<boolean>(true, { nonNullable: true })
  });

  /** Fields configured, in display order. */
  readonly fields = signal<FieldDraft[]>([]);
  /** Whether the new field form is open. */
  readonly addingField = signal(false);
  /** Whether the user already tried to save. */
  readonly submitted = signal(false);
  /** Error of the view, e.g. when there are no fields, or null. */
  readonly localError = signal<{ key: string; params: Record<string, unknown> } | null>(null);
  /** Whether the user changed the key, so it is no longer generated from the label. */
  private keyEditedByHand = false;
  /** Whether the form was already loaded with the type being edited. */
  private initialized = false;

  /** Value of the form as a signal. */
  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  /** Whether the type requires an attachment. */
  readonly requiresAttachment = computed(() => !!this.formValue().requiresAttachment);
  /** Whether the type deducts a balance. */
  readonly deductsBalance = computed(() => !!this.formValue().deductsBalance);

  /** Disabled form that shows how the fields will look for the employee. */
  readonly preview = computed(() => {
    const fields = this.fields().map((draft, index) => new RequestField({
      id: index + 1, key: draft.key, label: draft.label, dataType: draft.dataType, required: draft.required, displayOrder: index + 1
    }));
    const controls: Record<string, FormControl<string>> = {};
    fields.forEach(field => controls[field.key] = new FormControl<string>({ value: '', disabled: true }, { nonNullable: true }));
    return { fields, form: new FormGroup(controls) };
  });

  /** Whether another request type already uses the name. */
  readonly nameTaken = computed(() => {
    const name = this.formValue().name ?? '';
    return !!name.trim() && this.store.isRequestTypeNameTaken(name, this.typeId);
  });

  /**
   * Creates the view, generates the key from the label of a new field and loads the type being edited.
   *
   * @author Diego Alonso Diaz Villalba
   */
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

  /**
   * Opens the form to add a field, with default values.
   *
   * @author Diego Alonso Diaz Villalba
   */
  startNewField() {
    this.newFieldForm.reset({ label: '', key: '', dataType: 'TEXT', required: true });
    this.keyEditedByHand = false;
    this.addingField.set(true);
  }

  /**
   * Marks the key as edited by hand.
   *
   * @author Diego Alonso Diaz Villalba
   */
  onKeyEdited() {
    this.keyEditedByHand = true;
  }

  /** Whether another field already uses the key of the new field. */
  get newKeyTaken(): boolean {
    const key = this.newFieldForm.controls.key.value;
    return this.fields().some(field => field.key === key);
  }

  /**
   * Adds the new field to the list when it is valid and its key is not taken.
   *
   * @author Diego Alonso Diaz Villalba
   */
  addField() {
    this.newFieldForm.markAllAsTouched();
    if (this.newFieldForm.invalid || this.newKeyTaken) return;
    const { label, key, dataType, required } = this.newFieldForm.getRawValue();
    this.fields.update(fields => [...fields, { label: label.trim(), key, dataType, required }]);
    this.addingField.set(false);
  }

  /**
   * Removes a field.
   *
   * @param index - Position of the field.
   * @author Diego Alonso Diaz Villalba
   */
  removeField(index: number) {
    this.fields.update(fields => fields.filter((_, current) => current !== index));
  }

  /**
   * Moves a field one position up or down.
   *
   * @param index - Position of the field.
   * @param direction - -1 to move it up, 1 to move it down.
   * @author Diego Alonso Diaz Villalba
   */
  moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    this.fields.update(fields => {
      if (target < 0 || target >= fields.length) return fields;
      const copy = [...fields];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  /**
   * Makes a field required or optional.
   *
   * @param index - Position of the field.
   * @author Diego Alonso Diaz Villalba
   */
  toggleRequired(index: number) {
    this.fields.update(fields => fields.map((field, current) => current === index ? { ...field, required: !field.required } : field));
  }

  /**
   * Validates the form and adds or updates the request type, then goes back to the list.
   *
   * @author Diego Alonso Diaz Villalba
   */
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

  /**
   * Generates a camelCase key from a label, without accents or symbols.
   *
   * @param label - The label of the field.
   * @returns The key, up to 50 characters
   * @author Diego Alonso Diaz Villalba
   */
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
