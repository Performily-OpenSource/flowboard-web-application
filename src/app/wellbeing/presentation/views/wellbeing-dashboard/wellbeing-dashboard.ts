import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {WellbeingStore} from '../../../application/wellbeing.store';
import {HealthIndicator} from '../../../domain/model/health-indicator';
import {MetricType} from '../../../domain/model/metric-type';
import {Office} from '../../../domain/model/office.entity';
import {OfficeFormDialog} from '../../components/office-form-dialog/office-form-dialog';
import {DeviceDialog} from '../../components/device-dialog/device-dialog';
import {ThresholdDialog} from '../../components/threshold-dialog/threshold-dialog';
import {HistoryDialog} from '../../components/history-dialog/history-dialog';

@Component({
  selector: 'app-wellbeing-dashboard',
  imports: [MatButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, TranslatePipe],
  templateUrl: './wellbeing-dashboard.html',
  styleUrl: './wellbeing-dashboard.css'
})
/**
 * Displays the wellbeing indicator dashboard and allows workspaces, devices, and thresholds to be managed.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class WellbeingDashboard {
  readonly store = inject(WellbeingStore);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly tab = signal<'dashboard' | 'spaces' | 'thresholds'>('dashboard');
  readonly metricTypes: MetricType[] = ['TEMPERATURE', 'ILLUMINATION', 'AIR_QUALITY'];
  readonly sede = signal('');
  readonly floor = signal('');
  readonly state = signal('ACTIVE');

  readonly offices = computed(() => this.store.dashboardOffices());
  readonly filteredOffices = computed(() => this.store.offices().filter(office => {
    const sedeMatch = !this.sede() || office.location.building === this.sede();
    const floorMatch = !this.floor() || office.location.floor === this.floor();
    const stateMatch = this.state() === 'ALL' || (this.state() === 'ACTIVE' ? office.active : !office.active);
    return sedeMatch && floorMatch && stateMatch;
  }));

  readonly buildings = computed(() => [...new Set(this.store.offices().map(office => office.location.building))]);
  readonly floors = computed(() => [...new Set(this.store.offices().map(office => office.location.floor))]);

/**
 * Initializes the instance with the data required for operation.
 * @author Diana Li
 */
  constructor() {
    const routePath = this.route.snapshot.routeConfig?.path;
    if (routePath === 'spaces') this.tab.set('spaces');
    if (routePath === 'thresholds') this.tab.set('thresholds');
  }


  setTab(tab: 'dashboard' | 'spaces' | 'thresholds') { this.tab.set(tab); }
/**
 * Opens the form for creating a workspace.
 * @author Diana Li
 */
  openNewOffice(): void { this.dialog.open(OfficeFormDialog, {width: '540px'}); }
/**
 * Opens device management for the workspace.
 * @param office Parameter used by the operation.
 * @author Diana Li
 */
  openDeviceDialog(office: Office): void { this.dialog.open(DeviceDialog, {width: '620px', data: {office}}); }
/**
 * Opens the reading history for the workspace.
 * @param office Parameter used by the operation.
 * @param metricType Parameter used by the operation.
 * @author Diana Li
 */
  openHistory(office: Office, metricType: MetricType = 'TEMPERATURE'): void { this.dialog.open(HistoryDialog, {width: '880px', data: {office, metricType}}); }
/**
 * Opens the threshold configuration for a metric.
 * @param metricType Parameter used by the operation.
 * @author Diana Li
 */
  openThreshold(metricType: MetricType): void { const threshold = this.store.thresholdFor(metricType); if (threshold) this.dialog.open(ThresholdDialog, {width: '820px', data: {threshold}}); }

/**
 * Gets the calculated metric for a workspace.
 * @param office Parameter used by the operation.
 * @param metricType Parameter used by the operation.
 * @author Diana Li
 */
  officeMetric(office: Office, metricType: MetricType) {
    return this.store.dashboardOffices().find(item => item.office.id === office.id)?.metrics.find(item => item.metricType === metricType) ?? null;
  }

/**
 * Gets the translation key for a metric.
 * @param metric Parameter used by the operation.
 * @author Diana Li
 */
  metricKey(metric: MetricType): string {
    return metric === 'TEMPERATURE' ? 'wellbeing.metric.temperature' : metric === 'ILLUMINATION' ? 'wellbeing.metric.illumination' : 'wellbeing.metric.air-quality';
  }

/**
 * Gets the translation key for an indicator.
 * @param indicator Parameter used by the operation.
 * @author Diana Li
 */
  indicatorKey(indicator: HealthIndicator | 'NO_DATA' | null): string {
    if (indicator === 'OPTIMAL') return 'wellbeing.indicator.optimal';
    if (indicator === 'ACCEPTABLE') return 'wellbeing.indicator.acceptable';
    if (indicator === 'POOR') return 'wellbeing.indicator.poor';
    if (indicator === 'HAZARDOUS') return 'wellbeing.indicator.hazardous';
    return 'wellbeing.indicator.no-data';
  }

/**
 * Gets the unit of measurement for a metric.
 * @param metric Parameter used by the operation.
 * @author Diana Li
 */
  metricUnit(metric: MetricType): string { return metric === 'TEMPERATURE' ? '°C' : metric === 'ILLUMINATION' ? 'lx' : 'ppm'; }
/**
 * Converts an error key into its translated text.
 * @param error Parameter used by the operation.
 * @author Diana Li
 */
  translateError(error: string | null): string { return error ? this.translate.instant(error) : ''; }

/**
 * Formats an environmental value for display.
 * @param value Parameter used by the operation.
 * @param metric Parameter used by the operation.
 * @author Diana Li
 */
  formatMetric(value: number | null, metric: MetricType): string {
    if (value === null) return '—';
    if (metric === 'TEMPERATURE') return value.toFixed(1);
    return new Intl.NumberFormat('es-PE', {maximumFractionDigits: 0}).format(value);
  }

/**
 * Returns a relative description of the latest reading.
 * @param recordedAt Parameter used by the operation.
 * @author Diana Li
 */
  lastSeen(recordedAt: string | null): string {
    if (!recordedAt) return this.translate.instant('wellbeing.relative.no-readings');
    const deltaMinutes = Math.max(0, Math.round((Date.now() - new Date(recordedAt).getTime()) / 60000));
    if (deltaMinutes < 60) return this.translate.instant('wellbeing.relative.minutes', {minutes: deltaMinutes});
    const hours = Math.round(deltaMinutes / 60);
    return this.translate.instant('wellbeing.relative.hours', {hours});
  }

/**
 * Calculates the visual percentage associated with the indicator.
 * @param indicator Parameter used by the operation.
 * @author Diana Li
 */
  progress(indicator: HealthIndicator | 'NO_DATA' | null): number {
    switch (indicator) {
      case 'OPTIMAL': return 76;
      case 'ACCEPTABLE': return 55;
      case 'POOR': return 40;
      case 'HAZARDOUS': return 28;
      default: return 0;
    }
  }

/**
 * Gets the CSS class corresponding to the indicator.
 * @param indicator Parameter used by the operation.
 * @author Diana Li
 */
  progressClass(indicator: HealthIndicator | 'NO_DATA' | null): string {
    const value = (indicator ?? 'NO_DATA').toLowerCase();
    return `progress-${value}`;
  }

/**
 * Indicates whether any workspace has outdated readings.
 * @author Diana Li
 */
  hasStaleAlert(): boolean { return this.store.offices().some(office => this.store.isStale(office.id)); }
/**
 * Gets a workspace with outdated readings, if one exists.
 * @author Diana Li
 */
  staleOffice(): Office | undefined { return this.store.offices().find(office => this.store.isStale(office.id)); }
}
