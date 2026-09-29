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

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;
const IDENTITY_DOCUMENT_PATTERNS: Record<IdentityDocumentType, RegExp> = {
  DNI: /^\d{8}$/,
  CE: /^[A-Za-z0-9]{9,12}$/,
  PASSPORT: /^[A-Za-z0-9]{6,12}$/
};

type Step = 'personal' | 'employment' | 'documents' | 'review';

/** Rejects dates after today. Dates are YYYY-MM-DD strings, so they compare in calendar order. */
const notAfterToday: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const today = new Date().toLocaleDateString('en-CA');
  return control.value && control.value > today ? { futureDate: true } : null;
};

/** FIXED_TERM requires contractEndDate, which cannot be before hireDate (EmploymentPeriod rules). */
const employmentPeriodValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const { contractType, hireDate, contractEndDate } = group.value;
  if (contractType === 'FIXED_TERM' && !contractEndDate) return { contractEndDateRequired: true };
  if (hireDate && contractEndDate && contractEndDate < hireDate) return { contractEndBeforeHire: true };
  return null;
};

/** Registers (WA-44, WA-45, US08) or edits (US14) an employee in steps. */
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
  readonly store = inject(WorkspaceStore);

  readonly identityDocumentTypes = IDENTITY_DOCUMENT_TYPES;
  readonly contractTypes = CONTRACT_TYPES;
  readonly documentTypes = DOCUMENT_TYPES;
  readonly today = new Date().toLocaleDateString('en-CA');

  readonly employeeId: number | null = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
  readonly isEdit = this.employeeId !== null;
  private patched = false;

  /** The file step only exists when registering; documents of an existing employee are managed in WA-53. */
  readonly steps: Step[] = this.isEdit ? ['personal', 'employment', 'review'] : ['personal', 'employment', 'documents', 'review'];
  readonly stepIndex = signal(0);
  readonly currentStep = computed(() => this.steps[this.stepIndex()]);

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

  readonly employmentForm = this.fb.group({
    areaId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    positionId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    contractType: new FormControl<ContractType>('INDEFINITE', { nonNullable: true, validators: [Validators.required] }),
    hireDate: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    contractEndDate: new FormControl<string | null>(null),
    directManagerId: new FormControl<number | null>(null)
  }, { validators: [employmentPeriodValidator] });

  readonly documentForm = this.fb.group({
    documentType: new FormControl<DocumentType | null>(null, { validators: [Validators.required] })
  });

  readonly pendingDocuments = signal<PendingEmployeeDocument[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<{ key: string; params?: Record<string, string> } | null>(null);

  /** Summary shown when a step has errors (WA-45). */
  readonly stepError = signal<string | null>(null);

  private readonly selectedAreaId = toSignal(this.employmentForm.controls.areaId.valueChanges, { initialValue: null });
  readonly positionsOfArea = computed(() => this.store.getActivePositionsByArea(this.selectedAreaId()));
  readonly managerCandidates = computed(() =>
    this.store.activeEmployees().filter(employee => !this.store.wouldCreateCycle(this.employeeId, employee.id)));

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

  back() {
    this.stepError.set(null);
    this.stepIndex.update(index => Math.max(index - 1, 0));
  }

  goToStep(index: number) {
    if (index < this.stepIndex()) {
      this.stepError.set(null);
      this.stepIndex.set(index);
    }
  }

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

  addPendingDocument() {
    this.documentForm.markAllAsTouched();
    const documentType = this.documentForm.controls.documentType.value;
    const file = this.selectedFile();
    if (!documentType || !file || this.fileError()) return;
    this.pendingDocuments.update(documents => [...documents, { documentType, file }]);
    this.documentForm.reset();
    this.selectedFile.set(null);
  }

  removePendingDocument(index: number) {
    this.pendingDocuments.update(documents => documents.filter((_, i) => i !== index));
  }

  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }

  areaName(): string {
    const areaId = this.employmentForm.controls.areaId.value;
    return areaId ? this.store.getAreaById(areaId)()?.name ?? '-' : '-';
  }

  positionTitle(): string {
    const positionId = this.employmentForm.controls.positionId.value;
    return positionId ? this.store.getPositionById(positionId)()?.title ?? '-' : '-';
  }

  managerName(): string {
    const managerId = this.employmentForm.controls.directManagerId.value;
    return managerId ? this.store.getEmployeeById(managerId)()?.fullName ?? '-' : this.translate.instant('employee.no-manager');
  }

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
