import {Component, computed, effect, inject, signal} from '@angular/core';
import {Location} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {PayrollStore} from '../../../application/payroll.store';
import {FileReference, Money, Payslip} from '../../../domain/model/payslip.entity';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
type UploadStatus = 'recognized' | 'unrecognized';
interface UploadItem { file: File; employeeId: number | null; status: UploadStatus; }

@Component({
  selector: 'app-payslip-upload',
  imports: [MatButton, MatIcon, TranslatePipe],
  templateUrl: './payslip-upload.html',
  styleUrl: './payslip-upload.css'
})
export class PayslipUpload {
  readonly store = inject(PayrollStore);
  private readonly translate = inject(TranslateService);
  private readonly location = inject(Location);
  readonly selectedPeriodId = signal<number | null>(null);
  readonly effectivePeriodId = computed(() => this.selectedPeriodId() ?? this.store.latestPeriod()?.id ?? null);
  readonly documentType = signal('PAYSLIP');
  readonly files = signal<UploadItem[]>([]);
  readonly dragging = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly uploading = signal(false);
  private readonly initialOperationVersion = this.store.operationVersion();
  private readonly operationEffect = effect(() => {
    const version = this.store.operationVersion();
    if (version <= this.initialOperationVersion) return;
    const operationError = this.store.operationError();
    if (operationError) { this.error.set(operationError); this.uploading.set(false); }
    else { this.success.set(this.translate.instant('payroll.errors.bulk-success')); this.files.set([]); this.uploading.set(false); }
  });
  readonly recognizedFiles = computed(() => this.files().filter(item => item.status === 'recognized'));
  readonly unrecognizedFiles = computed(() => this.files().filter(item => item.status === 'unrecognized'));
  readonly recognizedCount = computed(() => this.recognizedFiles().length);
  readonly unrecognizedCount = computed(() => this.unrecognizedFiles().length);
  readonly activeEmployees = computed(() => this.store.employees().filter(employee => employee.isActive()));
  readonly employeesWithoutPayslip = computed(() => {
    const periodId = this.effectivePeriodId();
    const uploadedEmployeeIds = new Set(this.store.payslips().filter(p => p.payrollPeriodId === periodId).map(p => p.employeeId));
    this.files().forEach(item => { if (item.employeeId !== null) uploadedEmployeeIds.add(item.employeeId); });
    return this.activeEmployees().filter(employee => !uploadedEmployeeIds.has(employee.id)).length;
  });

  onPeriodChange(value: string): void { this.selectedPeriodId.set(Number(value)); this.error.set(''); this.success.set(''); this.refreshAssociations(); }
  onDocumentTypeChange(value: string): void { this.documentType.set(value); }
  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragging.set(true); }
  onDragLeave(event: DragEvent): void { event.preventDefault(); this.dragging.set(false); }
  onDrop(event: DragEvent): void { event.preventDefault(); this.dragging.set(false); this.addFiles(event.dataTransfer?.files ?? null); }
  onFileChange(event: Event): void { const input = event.target as HTMLInputElement; this.addFiles(input.files); input.value = ''; }
  removeFile(item: UploadItem): void { this.files.update(files => files.filter(current => current !== item)); this.error.set(''); this.success.set(''); }
  employeeName(id: number | null): string { return id === null ? this.translate.instant('payroll.upload-page-ui.no-match') : (this.store.getEmployeeById(id)?.fullName ?? this.translate.instant('payroll.upload-page-ui.no-match')); }
  fileSize(file: File): string { return `${Math.max(1, Math.round(file.size / 1024))} KB`; }
  goBack(): void { this.location.back(); }

  async upload(): Promise<void> {
    this.error.set(''); this.success.set('');
    if (!this.files().length) { this.error.set(this.translate.instant('payroll.errors.missing-files')); return; }
    if (this.unrecognizedCount() > 0) { this.error.set(this.translate.instant('payroll.errors.unrecognized-files')); return; }
    const items = this.recognizedFiles();
    const duplicate = items.find(item => item.employeeId !== null && this.store.existsForEmployeePeriod(item.employeeId, this.effectivePeriodId()!));
    if (duplicate) { this.error.set(this.translate.instant('payroll.errors.duplicate-employee', {employee: this.employeeName(duplicate.employeeId)})); return; }
    this.uploading.set(true);
    try {
      const requests = await Promise.all(items.map(async item => {
        const dataUrl = await this.readAsDataUrl(item.file);
        return new Payslip({
          id: 0, employeeId: item.employeeId!, payrollPeriodId: this.effectivePeriodId()!,
          file: new FileReference({fileName: item.file.name, contentType: 'application/pdf', sizeInBytes: item.file.size, storageUrl: dataUrl}),
          issueDate: new Date().toISOString().slice(0, 10), netAmount: new Money(0, 'PEN'), publicationStatus: 'UNDER_REVIEW'
        });
      }));
      this.store.createPayslips(requests);
    } catch (error) { this.error.set(error instanceof Error ? error.message : this.translate.instant('payroll.errors.read-file')); this.uploading.set(false); }
  }

  private addFiles(fileList: FileList | null): void {
    if (!fileList?.length) return;
    this.error.set(''); this.success.set('');
    const incoming = Array.from(fileList), existingNames = new Set(this.files().map(item => item.file.name));
    const valid: UploadItem[] = [], invalid: string[] = [];
    for (const file of incoming) {
      if (existingNames.has(file.name)) continue;
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { invalid.push(this.translate.instant('payroll.errors.invalid-file', {file: file.name})); continue; }
      if (file.size > MAX_FILE_SIZE) { invalid.push(this.translate.instant('payroll.errors.file-size', {file: file.name})); continue; }
      valid.push(this.createUploadItem(file)); existingNames.add(file.name);
    }
    if (valid.length) this.files.update(files => [...files, ...valid]);
    if (invalid.length) this.error.set(invalid.join(' · '));
  }

  private createUploadItem(file: File): UploadItem {
    const documentNumber = file.name.match(/^\s*(\d{8,12})/)?.[1] ?? null;
    const employee = documentNumber ? this.activeEmployees().find(item => item.identityDocumentNumber === documentNumber) : undefined;
    return {file, employeeId: employee?.id ?? null, status: employee ? 'recognized' : 'unrecognized'};
  }

  private refreshAssociations(): void { this.files.update(files => files.map(item => { const refreshed = this.createUploadItem(item.file); return {...item, employeeId: refreshed.employeeId, status: refreshed.status}; })); }
  private readAsDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error(this.translate.instant('payroll.errors.file-read-name', {file: file.name}))); reader.readAsDataURL(file); }); }
}
