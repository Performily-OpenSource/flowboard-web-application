import {DatePipe} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {EnvironmentalReading} from '../../../domain/model/environmental-reading.entity';
import {MetricType} from '../../../domain/model/metric-type';
import {Office} from '../../../domain/model/office.entity';
import {WellbeingStore} from '../../../application/wellbeing.store';

@Component({selector:'app-history-dialog', imports:[DatePipe,MatDialogClose,MatDialogTitle,MatButton,MatIcon,TranslatePipe], templateUrl:'./history-dialog.html', styleUrl:'./history-dialog.css'})
export class HistoryDialog {
  readonly data = inject<{office: Office; metricType: MetricType}>(MAT_DIALOG_DATA);
  private readonly store = inject(WellbeingStore);
  private readonly translate = inject(TranslateService);
  readonly metricType = signal<MetricType>(this.data.metricType);
  private readonly today = new Date();
  readonly start = signal(this.toDateInput(new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 28)));
  readonly end = signal(this.toDateInput(this.today));
  readonly rows = computed(() => { 
    const start = new Date(`${this.start()}T00:00:00`); 
    const end = new Date(`${this.end()}T23:59:59`); 
    return start <= end && end <= new Date() ? this.store.readingsForHistory(this.data.office.id, this.metricType(), start, end) : []; });
  
    readonly valid = computed(() => { 
    const start = new Date(`${this.start()}T00:00:00`); const end = new Date(`${this.end()}T00:00:00`); const today = new Date(); today.setHours(0,0,0,0); return start <= end && start <= today && end <= today; });
  private toDateInput(date: Date): string { 
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; 
  }
  
  selectMetric(metric: MetricType): void { 
    this.metricType.set(metric); }
  
  labelKey(metric: MetricType): string { 
    return metric === 'TEMPERATURE' ? 'wellbeing.metric.temperature' : metric === 'ILLUMINATION' ? 'wellbeing.metric.illumination' : 'wellbeing.metric.air-quality'; }
  
    unit(metric: MetricType): string { 
    return metric === 'TEMPERATURE' ? '°C' : metric === 'ILLUMINATION' ? 'lx' : 'ppm'; }
 
  format(reading: EnvironmentalReading): string { 
    return reading.measurement.value.toLocaleString('es-PE', {maximumFractionDigits: reading.measurement.metricType === 'TEMPERATURE' ? 1 : 0}); }
  
    height(reading: EnvironmentalReading): number { 
    const values = this.rows().map(item => item.measurement.value); const min = Math.min(...values, reading.measurement.value); const max = Math.max(...values, reading.measurement.value); return max === min ? 45 : 14 + ((reading.measurement.value - min) / (max - min)) * 70; }
  
    translated(key: string): string { return this.translate.instant(key); }
}
