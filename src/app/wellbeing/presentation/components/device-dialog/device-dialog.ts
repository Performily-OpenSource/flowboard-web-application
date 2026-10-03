import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Device} from '../../../domain/model/device.entity';
import {MetricType} from '../../../domain/model/metric-type';
import {Office} from '../../../domain/model/office.entity';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {WellbeingStore} from '../../../application/wellbeing.store';

@Component({selector:'app-device-dialog', imports:[ReactiveFormsModule,MatDialogClose,MatDialogTitle,MatButton,MatIcon,TranslatePipe], templateUrl:'./device-dialog.html', styleUrl:'./device-dialog.css'})
/**
 * Manages device registration and linking for a workspace.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class DeviceDialog extends BaseForm {
  readonly store = inject(WellbeingStore);
  readonly data = inject<{office: Office}>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeviceDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  readonly form = this.fb.nonNullable.group({code:['', [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9-]+$/)]], temperature:[true], illumination:[true], airQuality:[true]});

/**
 * Initializes the instance with the data required for operation.
 * @author Diana Li
 */
  constructor() { super(); }

/**
 * Executes the availableDevices operation of the component.
 * @author Diana Li
 */
  availableDevices(): Device[] { return this.store.devices().filter(device => device.status === 'IN_INVENTORY'); }
/**
 * Executes the linkedDevices operation of the component.
 * @author Diana Li
 */
  linkedDevices(): Device[] { return this.store.devices().filter(device => device.officeId === this.data.office.id); }
/**
 * Executes the metrics operation of the component.
 * @param device Parameter used by the operation.
 * @author Diana Li
 */
  metrics(device: Device): string { return [...device.supportedMetrics].map(m => this.translate.instant(m === 'TEMPERATURE' ? 'wellbeing.metric.temperature' : m === 'ILLUMINATION' ? 'wellbeing.metric.illumination' : 'wellbeing.metric.air-quality')).join(', '); }
/**
 * Links an available device to the workspace.
 * @param device Parameter used by the operation.
 * @author Diana Li
 */
  link(device: Device): void { try { this.store.linkDevice(device, this.data.office.id); } catch {} }
/**
 * Unlinks a device from the workspace.
 * @param device Parameter used by the operation.
 * @author Diana Li
 */
  unlink(device: Device): void { this.store.unlinkDevice(device); }
/**
 * Registers a device and links it to the workspace.
 * @author Diana Li
 */
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
