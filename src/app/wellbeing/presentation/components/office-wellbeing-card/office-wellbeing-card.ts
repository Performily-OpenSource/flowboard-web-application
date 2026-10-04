import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {DashboardMetric, WellbeingStore} from '../../../application/wellbeing.store';
import {HealthIndicator} from '../../../domain/model/health-indicator';

/** Health indicator of an office row, or no data when there are no recent readings. */
type RowIndicator = HealthIndicator | 'NO_DATA';

/**
 * One office shown in the wellbeing card.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface OfficeWellbeingRow {
  officeId: number;
  name: string;
  /** Latest value per metric already formatted ("22.4 °C"); empty when the office has no recent readings. */
  values: string[];
  /** Hours since the last reading when the office only has outdated readings; null otherwise. */
  staleHours: number | null;
  indicator: RowIndicator;
}

/** Hours after which a reading is no longer used to classify an office (same validity the store uses). */
const VALIDITY_HOURS = 6;
const HOUR_MS = 60 * 60 * 1000;
/** Sort priority: worst status first, then offices without data, then healthy ones. */
const ROW_PRIORITY: Record<RowIndicator, number> = {HAZARDOUS: 0, POOR: 1, NO_DATA: 2, ACCEPTABLE: 3, OPTIMAL: 4};
const SEVERITY: Record<HealthIndicator, number> = {OPTIMAL: 1, ACCEPTABLE: 2, POOR: 3, HAZARDOUS: 4};
const MAX_ROWS = 4;

/**
 * "Bienestar de los espacios" card of the HR dashboard (WA-02, bottom-right card),
 * registered in DASHBOARD_WIDGETS for the 'hr' dashboard in the 'column-2' slot (order 2).
 * Lists up to four active offices with their latest value per metric and the worst health indicator.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-office-wellbeing-card',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './office-wellbeing-card.html',
  styleUrl: './office-wellbeing-card.css',
})
export class OfficeWellbeingCard {
  private readonly store = inject(WellbeingStore);

  /** Whether the store is still loading its data. */
  readonly loading = this.store.loading;

  /**
   * Reference time used to judge freshness: now when there are live readings, otherwise the time of the
   * latest reading in the system (the seed data is older than today).
   */
  readonly referenceTime = computed(() => {
    const now = Date.now();
    const latest = this.store.readings().reduce((max, reading) => {
      const time = new Date(reading.recordedAt).getTime();
      return Number.isFinite(time) && time > max ? time : max;
    }, 0);
    return latest > 0 && now - latest > VALIDITY_HOURS * HOUR_MS ? latest : now;
  });

  /** Up to four active offices, worst status first, then those without data. */
  readonly rows = computed<OfficeWellbeingRow[]>(() => {
    const reference = this.referenceTime();
    return this.store.dashboardOffices()
      .map(item => this.toRow(item.office.id, item.office.name, item.metrics, reference))
      .sort((a, b) => ROW_PRIORITY[a.indicator] - ROW_PRIORITY[b.indicator] || a.officeId - b.officeId)
      .slice(0, MAX_ROWS);
  });

  /**
   * Gets the translation key of a health indicator label.
   *
   * @param indicator - Indicator of the row
   * @returns The i18n key of the label
   * @author Oscar Lizandro Vasquez Llave
   */
  indicatorKey(indicator: RowIndicator): string {
    switch (indicator) {
      case 'OPTIMAL': return 'wellbeing-dashboard.indicator.optimal';
      case 'ACCEPTABLE': return 'wellbeing.indicator.acceptable';
      case 'POOR': return 'wellbeing.indicator.poor';
      case 'HAZARDOUS': return 'wellbeing-dashboard.indicator.hazardous';
      default: return 'wellbeing-dashboard.indicator.no-data';
    }
  }

  /**
   * Builds a row keeping only the metrics whose latest reading is still valid at the reference time.
   *
   * @param officeId - Office identifier
   * @param name - Office name
   * @param metrics - Latest reading per metric computed by the store
   * @param reference - Reference time in milliseconds
   * @returns The row to display
   * @author Oscar Lizandro Vasquez Llave
   */
  private toRow(officeId: number, name: string, metrics: DashboardMetric[], reference: number): OfficeWellbeingRow {
    const withData = metrics.filter(metric => metric.value !== null && metric.recordedAt !== null);
    const fresh = withData.filter(metric => reference - new Date(metric.recordedAt!).getTime() <= VALIDITY_HOURS * HOUR_MS);
    const indicators = fresh.map(metric => metric.indicator).filter((i): i is HealthIndicator => i !== null);
    const indicator: RowIndicator = indicators.length
      ? indicators.reduce((worst, current) => SEVERITY[current] > SEVERITY[worst] ? current : worst)
      : 'NO_DATA';
    let staleHours: number | null = null;
    if (!fresh.length && withData.length) {
      const last = Math.max(...withData.map(metric => new Date(metric.recordedAt!).getTime()));
      staleHours = Math.max(1, Math.round((reference - last) / HOUR_MS));
    }
    return {officeId, name, values: fresh.map(metric => this.formatMetric(metric)), staleHours, indicator};
  }

  /**
   * Formats a metric value with its unit (one decimal for temperature, integers for the rest).
   *
   * @param metric - Metric with value
   * @returns The formatted value, e.g. "22.4 °C"
   * @author Oscar Lizandro Vasquez Llave
   */
  private formatMetric(metric: DashboardMetric): string {
    const value = metric.metricType === 'TEMPERATURE' ? metric.value!.toFixed(1) : Math.round(metric.value!).toString();
    return `${value} ${metric.unit}`;
  }
}
