import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Device, MetricType, Office} from '../../../domain/model/wellbeing.model';
import {WellbeingStore} from '../../../application/wellbeing.store';

@Component({selector:'app-device-dialog', imports:[ReactiveFormsModule,MatDialogClose,MatDialogTitle,MatButton,MatIcon,TranslatePipe], templateUrl:'./device-dialog.html', styleUrl:'./device-dialog.css'})
export class DeviceDialog {
  readonly store = inject(WellbeingStore);
  readonly data = inject<{office: Office}>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeviceDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  readonly form = this.fb.nonNullable.group({code:['', [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9-]+$/)]], temperature:[true], illumination:[true], airQuality:[true]});

  availableDevices(): Device[] { return this.store.devices().filter(device => device.status === 'IN_INVENTORY'); }
  linkedDevices(): Device[] { return this.store.devices().filter(device => device.officeId === this.data.office.id); }
  metrics(device: Device): string { return [...device.supportedMetrics].map(m => this.translate.instant(m === 'TEMPERATURE' ? 'wellbeing.metric.temperature' : m === 'ILLUMINATION' ? 'wellbeing.metric.illumination' : 'wellbeing.metric.air-quality')).join(', '); }
  link(device: Device): void { try { this.store.linkDevice(device, this.data.office.id); } catch {} }
  unlink(device: Device): void { this.store.unlinkDevice(device); }
  registerAndLink(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const metrics: MetricType[] = [];
    if (raw.temperature) metrics.push('TEMPERATURE'); if (raw.illumination) metrics.push('ILLUMINATION'); if (raw.airQuality) metrics.push('AIR_QUALITY');
    if (!metrics.length) return;
    try { this.store.createAndLinkDevice(raw.code, metrics, this.data.office.id); this.form.reset({code:'',temperature:true,illumination:true,airQuality:true}); } catch {}
  }
}
