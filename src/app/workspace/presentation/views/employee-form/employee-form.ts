import {Component, computed, effect, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {PendingEmployeeDocument, WorkspaceStore} from '../../../application/workspace.store';
import {
  CONTRACT_TYPES,
  ContractType,
  Employee,
  IDENTITY_DOCUMENT_TYPES,
  IdentityDocumentType
} from '../../../domain/model/employee.entity';
import {DOCUMENT_TYPES, DocumentType} from '../../../domain/model/employee-document.entity';
import {
  ALLOWED_DOCUMENT_CONTENT_TYPES,
  MAX_DOCUMENT_SIZE_IN_BYTES
} from '../../components/document-upload-dialog/document-upload-dialog';
import {EmployeeDocumentTable} from '../../components/employee-document-table/employee-document-table';

/** Letters (including Spanish accents), apostrophes, spaces and hyphens. */
const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
/** Optional leading plus sign followed by 7 to 15 digits. */
const PHONE_PATTERN = /^\+?\d{7,15}$/;
/** Format of the identity document number for each document type. */
const IDENTITY_DOCUMENT_PATTERNS: Record<IdentityDocumentType, RegExp> = {
  DNI: /^\d{8}$/,
  CE: /^[A-Za-z0-9]{9,12}$/,
  PASSPORT: /^[A-Za-z0-9]{6,12}$/
};

/** Steps of the employee form stepper. */
type Step = 'personal' | 'employment' | 'documents' | 'review';

/**
 * Rejects dates after today. Dates are YYYY-MM-DD strings, so they compare in calendar order.
 *
 * @param control - The date control to validate.
 * @returns A futureDate error if the date is after today, null otherwise
 * @author Oscar Lizandro Vasquez Llave
 */
const notAfterToday: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const today = new Date().toLocaleDateString('en-CA');
  return control.value && control.value > today ? { futureDate: true } : null;
};

/**
 * FIXED_TERM requires contractEndDate, which cannot be before hireDate (EmploymentPeriod rules).
 *
 * @param group - The employment form group.
 * @returns A contractEndDateRequired or contractEndBeforeHire error, null if the period is valid
 * @author Oscar Lizandro Vasquez Llave
 */
const employmentPeriodValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const { contractType, hireDate, contractEndDate } = group.value;
  if (contractType === 'FIXED_TERM' && !contractEndDate) return { contractEndDateRequired: true };
  if (hireDate && contractEndDate && contractEndDate < hireDate) return { contractEndBeforeHire: true };
  return null;
};

/**
 * Employee form view (WA-44, WA-45).
 *
 * Registers (US08) or edits (US14) an employee in a stepper with the personal, employment,
 * documents and review steps. Each step is validated before moving on, and the edit mode
 * skips the documents step.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-employee-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatIcon,
    TranslatePipe,
    LocalDatePipe
  ],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm extends BaseForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  /** Workspace store used to read areas, positions and employees and to save the employee. */
  readonly store = inject(WorkspaceStore);

  /** Available identity document types. */
  readonly identityDocumentTypes = IDENTITY_DOCUMENT_TYPES;
  /** Available contract types. */
  readonly contractTypes = CONTRACT_TYPES;
  /** Available document types for the documents step. */
  readonly documentTypes = DOCUMENT_TYPES;
  /** Today as a YYYY-MM-DD string, used as the max value of date inputs. */
  readonly today = new Date().toLocaleDateString('en-CA');

  /** Id of the employee being edited, or null when registering a new one. */
  readonly employeeId: number | null = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
  /** Whether the form edits an existing employee. */
  readonly isEdit = this.employeeId !== null;
  /** Whether the edited employee has already been patched into the forms. */
  private patched = false;

  /** The file step only exists when registering; documents of an existing employee are managed in WA-53. */
  readonly steps: Step[] = this.isEdit ? ['personal', 'employment', 'review'] : ['personal', 'employment', 'documents', 'review'];
  /** Index of the current step. */
  readonly stepIndex = signal(0);
  /** The current step. */
  readonly currentStep = computed(() => this.steps[this.stepIndex()]);

  /** Personal data step: names, identity document, birth date, contact and address. */
  readonly personalForm = this.fb.group({
    firstName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50), Validators.pattern(NAME_PATTERN)] }),
    lastName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80), Validators.pattern(NAME_PATTERN)] }),
    identityDocumentType: new FormControl<IdentityDocumentType>('DNI', { nonNullable: true, validators: [Validators.required] }),
    identityDocumentNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(IDENTITY_DOCUMENT_PATTERNS.DNI)] }),
    birthDate: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, notAfterToday] }),
    phoneNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(PHONE_PATTERN)] }),
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(120)] }),
    addressStreet: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    addressDistrict: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    addressProvince: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    addressDepartment: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] })
  });

  /** Employment data step: area, position, contract, hire date and direct manager. */
  readonly employmentForm = this.fb.group({
    areaId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    positionId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    contractType: new FormControl<ContractType>('INDEFINITE', { nonNullable: true, validators: [Validators.required] }),
    hireDate: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    contractEndDate: new FormControl<string | null>(null),
    directManagerId: new FormControl<number | null>(null)
  }, { validators: [employmentPeriodValidator] });

  /** Documents step: type of the document to attach. */
  readonly documentForm = this.fb.group({
    documentType: new FormControl<DocumentType | null>(null, { validators: [Validators.required] })
  });

  /** Documents to upload once the employee is registered. */
  readonly pendingDocuments = signal<PendingEmployeeDocument[]>([]);
  /** File selected in the documents step. */
  readonly selectedFile = signal<File | null>(null);
  /** Validation error of the selected file, as an i18n key and its params. */
  readonly fileError = signal<{ key: string; params?: Record<string, string> } | null>(null);

  /** Summary shown when a step has errors (WA-45). */
  readonly stepError = signal<string | null>(null);

  /** Area selected in the employment step. */
  private readonly selectedAreaId = toSignal(this.employmentForm.controls.areaId.valueChanges, { initialValue: null });
  /** Active positions of the selected area. */
  readonly positionsOfArea = computed(() => this.store.getActivePositionsByArea(this.selectedAreaId()));
  /** Active employees that can be the direct manager without creating a reporting cycle. */
  readonly managerCandidates = computed(() =>
    this.store.activeEmployees().filter(employee => !this.store.wouldCreateCycle(this.employeeId, employee.id)));

  /**
   * Updates the identity document number pattern when the document type changes,
   * clears the position when it does not belong to the selected area and, in edit mode,
   * patches the forms once the employee is available.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor() {
    super();

    this.personalForm.controls.identityDocumentType.valueChanges.subscribe(type => {
      const numberControl = this.personalForm.controls.identityDocumentNumber;
      numberControl.setValidators([Validators.required, Validators.pattern(IDENTITY_DOCUMENT_PATTERNS[type])]);
      numberControl.updateValueAndValidity();
    });

    this.employmentForm.controls.areaId.valueChanges.subscribe(areaId => {
      const positionId = this.employmentForm.controls.positionId.value;
      const position = positionId ? this.store.getPositionById(positionId)() : undefined;
      if (position && areaId && !position.belongsTo(areaId)) {
        this.employmentForm.controls.positionId.setValue(null);
      }
    });

    effect(() => {
      if (!this.employeeId || this.patched) return;
      const employee = this.store.getEmployeeById(this.employeeId)();
      if (!employee) return;
      this.patched = true;
      this.personalForm.patchValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        identityDocumentType: employee.identityDocumentType,
        identityDocumentNumber: employee.identityDocumentNumber,
        birthDate: employee.birthDate,
        phoneNumber: employee.phoneNumber,
        email: employee.email,
        addressStreet: employee.addressStreet,
        addressDistrict: employee.addressDistrict,
        addressProvince: employee.addressProvince,
        addressDepartment: employee.addressDepartment
      });
      this.employmentForm.patchValue({
        areaId: employee.areaId,
        positionId: employee.positionId,
        contractType: employee.contractType,
        hireDate: employee.hireDate,
        contractEndDate: employee.contractEndDate,
        directManagerId: employee.directManagerId
      });
    });
  }

  /** Validates the current step before moving on (WA-45). */
  next() {
    const step = this.currentStep();
    if (step === 'personal' && !this.validateStep(this.personalForm, true)) return;
    if (step === 'employment' && !this.validateStep(this.employmentForm, false)) return;
    this.stepError.set(null);
    this.stepIndex.update(index => Math.min(index + 1, this.steps.length - 1));
  }

  /** Goes back to the previous step. */
  back() {
    this.stepError.set(null);
    this.stepIndex.update(index => Math.max(index - 1, 0));
  }

  /**
   * Jumps back to a previous step; forward jumps are ignored.
   *
   * @param index - The index of the target step.
   * @author Oscar Lizandro Vasquez Llave
   */
  goToStep(index: number) {
    if (index < this.stepIndex()) {
      this.stepError.set(null);
      this.stepIndex.set(index);
    }
  }

  /**
   * Stores the selected file and validates its content type and size.
   *
   * @param event - The change event of the file input.
   * @param input - The file input, reset so the same file can be selected again.
   * @author Oscar Lizandro Vasquez Llave
   */
  onFileSelected(event: Event, input: HTMLInputElement) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    input.value = '';
    this.selectedFile.set(file);
    this.fileError.set(null);
    if (!file) return;
    if (!ALLOWED_DOCUMENT_CONTENT_TYPES.includes(file.type)) {
      this.fileError.set({ key: 'document-upload.error.invalid-type' });
    } else if (file.size > MAX_DOCUMENT_SIZE_IN_BYTES) {
      this.fileError.set({ key: 'document-upload.error.too-large', params: { size: this.formatSize(file.size) } });
    }
  }

  /** Adds the selected file and type to the pending documents if both are valid. */
  addPendingDocument() {
    this.documentForm.markAllAsTouched();
    const documentType = this.documentForm.controls.documentType.value;
    const file = this.selectedFile();
    if (!documentType || !file || this.fileError()) return;
    this.pendingDocuments.update(documents => [...documents, { documentType, file }]);
    this.documentForm.reset();
    this.selectedFile.set(null);
  }

  /**
   * Removes a pending document.
   *
   * @param index - The index of the pending document.
   * @author Oscar Lizandro Vasquez Llave
   */
  removePendingDocument(index: number) {
    this.pendingDocuments.update(documents => documents.filter((_, i) => i !== index));
  }

  /**
   * Formats a file size for display.
   *
   * @param sizeInBytes - The size of the file in bytes.
   * @returns The human readable size
   * @author Oscar Lizandro Vasquez Llave
   */
  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }

  /**
   * Gets the name of the selected area for the review step.
   *
   * @returns The area name, or "-" if none is selected
   * @author Oscar Lizandro Vasquez Llave
   */
  areaName(): string {
    const areaId = this.employmentForm.controls.areaId.value;
    return areaId ? this.store.getAreaById(areaId)()?.name ?? '-' : '-';
  }

  /**
   * Gets the title of the selected position for the review step.
   *
   * @returns The position title, or "-" if none is selected
   * @author Oscar Lizandro Vasquez Llave
   */
  positionTitle(): string {
    const positionId = this.employmentForm.controls.positionId.value;
    return positionId ? this.store.getPositionById(positionId)()?.title ?? '-' : '-';
  }

  /**
   * Gets the name of the selected direct manager for the review step.
   *
   * @returns The manager name, or the translated "no manager" text if none is selected
   * @author Oscar Lizandro Vasquez Llave
   */
  managerName(): string {
    const managerId = this.employmentForm.controls.directManagerId.value;
    return managerId ? this.store.getEmployeeById(managerId)()?.fullName ?? '-' : this.translate.instant('employee.no-manager');
  }

  /**
   * Validates both data steps and saves the employee.
   * Registers it with its pending documents and returns to the list, or updates it and returns to its file.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  submit() {
    if (!this.validateStep(this.personalForm, true)) {
      this.stepIndex.set(0);
      return;
    }
    if (!this.validateStep(this.employmentForm, false)) {
      this.stepIndex.set(1);
      return;
    }

    const personal = this.personalForm.getRawValue();
    const employment = this.employmentForm.getRawValue();
    const current = this.employeeId ? this.store.getEmployeeById(this.employeeId)() : undefined;

    const employee = new Employee({
      id: this.employeeId ?? 0,
      firstName: personal.firstName.trim(),
      lastName: personal.lastName.trim(),
      identityDocumentType: personal.identityDocumentType,
      identityDocumentNumber: personal.identityDocumentNumber.trim(),
      birthDate: personal.birthDate,
      email: personal.email.trim().toLowerCase(),
      phoneNumber: personal.phoneNumber.trim(),
      addressStreet: personal.addressStreet.trim(),
      addressDistrict: personal.addressDistrict.trim(),
      addressProvince: personal.addressProvince.trim(),
      addressDepartment: personal.addressDepartment.trim(),
      contractType: employment.contractType,
      hireDate: employment.hireDate,
      contractEndDate: employment.contractEndDate || null,
      status: current?.status ?? 'ACTIVE',
      terminationReason: current?.terminationReason ?? null,
      terminationDate: current?.terminationDate ?? null,
      areaId: employment.areaId!,
      positionId: employment.positionId!,
      directManagerId: employment.directManagerId
    });

    if (this.isEdit) {
      this.store.updateEmployee(employee);
      this.router.navigate(['/workspace/employees', this.employeeId]).then();
    } else {
      this.store.addEmployee(employee, this.pendingDocuments());
      this.router.navigate(['/workspace/employees']).then();
    }
  }

  /**
   * Validates a step form and sets the summary of its errors.
   *
   * @param form          - The form group of the step.
   * @param checkDocument - Whether to check that the identity document is not taken.
   * @returns True if the step is valid, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  private validateStep(form: FormGroup, checkDocument: boolean): boolean {
    form.markAllAsTouched();
    const missing = Object.values(form.controls).filter(control => control.hasError('required')).length;
    const invalid = Object.values(form.controls)
      .filter(control => control.invalid && !control.hasError('required') && !control.hasError('taken')).length;
    const duplicated = checkDocument && this.checkDuplicatedDocument();
    const groupErrors = form.errors ? 1 : 0;
    if (!missing && !invalid && !duplicated && !groupErrors) {
      this.stepError.set(null);
      return true;
    }
    const parts: string[] = [];
    if (missing) parts.push(this.translate.instant('employee-form.missing-fields', { count: missing }));
    if (invalid + groupErrors) parts.push(this.translate.instant('employee-form.invalid-fields', { count: invalid + groupErrors }));
    if (duplicated) parts.push(this.translate.instant('employee-form.duplicated-document'));
    this.stepError.set(this.translate.instant('employee-form.step-errors', { errors: parts.join(', ') }));
    return false;
  }

  /**
   * Checks if another active employee already has the entered identity document.
   * Marks the number control with a taken error naming the owner.
   *
   * @returns True if the identity document is taken, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  private checkDuplicatedDocument(): boolean {
    const { identityDocumentType, identityDocumentNumber } = this.personalForm.getRawValue();
    const owner = this.store.activeEmployees().find(employee =>
      employee.id !== this.employeeId &&
      employee.identityDocumentType === identityDocumentType &&
      employee.identityDocumentNumber === identityDocumentNumber.trim());
    const control = this.personalForm.controls.identityDocumentNumber;
    if (owner) {
      control.setErrors({ ...control.errors, taken: { owner: owner.fullName } });
    }
    return !!owner;
  }
}
