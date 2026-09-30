import {computed, Injectable, signal} from '@angular/core';
import {forkJoin, retry} from 'rxjs';
import {WellbeingApi} from '../infrastructure/wellbeing-api';
import {
  Device, DeviceCode, DeviceResource, EnvironmentalReading, HealthIndicator, MetricThreshold, MetricType, MetricValue, Office, OfficeLocation, OfficeResource,
  ReadingResource, ThresholdRange, ThresholdRangeResource, ThresholdResource
} from '../domain/model/wellbeing.model';

export interface DashboardMetric {
  metricType: MetricType;
  value: number | null;
  unit: string;
  indicator: HealthIndicator | null;
  recordedAt: string | null;
}

export interface DashboardOffice {
  office: Office;
  metrics: DashboardMetric[];
  overallIndicator: HealthIndicator | 'NO_DATA';
}

@Injectable({providedIn: 'root'})
export class WellbeingStore {
  private readonly officesSignal = signal<Office[]>([]);
  private readonly devicesSignal = signal<Device[]>([]);
  private readonly readingsSignal = signal<EnvironmentalReading[]>([]);
  private readonly thresholdsSignal = signal<MetricThreshold[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly offices = this.officesSignal.asReadonly();
  readonly devices = this.devicesSignal.asReadonly();
  readonly readings = this.readingsSignal.asReadonly();
  readonly thresholds = this.thresholdsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly activeOffices = computed(() => this.offices().filter(office => office.active));
  readonly inventoryDevices = computed(() => this.devices().filter(device => device.status === 'IN_INVENTORY'));

  constructor(private readonly api: WellbeingApi) {
    this.loadAll();
  }

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({
      offices: this.api.getOffices(),
      devices: this.api.getDevices(),
      readings: this.api.getReadings(),
      thresholds: this.api.getThresholds(),
      ranges: this.api.getThresholdRanges()
    }).pipe(retry(2)).subscribe({
      next: ({offices, devices, readings, thresholds, ranges}) => {
        this.officesSignal.set(this.toOffices(offices));
        this.devicesSignal.set(this.toDevices(devices));
        this.readingsSignal.set(this.toReadings(readings));
        this.thresholdsSignal.set(this.toThresholds(thresholds, ranges));
        this.reconnectDevices();
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(error instanceof Error ? error.message : 'wellbeing.errors.load');
        this.loadingSignal.set(false);
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  dashboardOffices(): DashboardOffice[] {
    return this.offices().filter(office => office.active).map(office => {
      const metrics = (['TEMPERATURE', 'ILLUMINATION', 'AIR_QUALITY'] as MetricType[]).map(metricType => {
        const reading = this.latestReading(office.id, metricType, true);
        const threshold = this.thresholdFor(metricType);
        const indicator = reading && threshold ? reading.classify(threshold) : null;
        return {
          metricType,
          value: reading?.measurement.value ?? null,
          unit: new MetricValue(metricType, reading?.measurement.value ?? this.defaultValue(metricType)).unit(),
          indicator,
          recordedAt: reading?.recordedAt ?? null
        };
      });
      const indicators = metrics.map(metric => metric.indicator).filter((indicator): indicator is HealthIndicator => indicator !== null);
      return {office, metrics, overallIndicator: this.worstIndicator(indicators)};
    });
  }

  latestReading(officeId: number, metricType: MetricType, onlyRecent = true): EnvironmentalReading | undefined {
    return this.readings()
      .filter(reading => reading.officeId === officeId && reading.measurement.metricType === metricType)
      .filter(reading => !onlyRecent || reading.isRecent(6))
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
  }

  readingsForHistory(officeId: number, metricType: MetricType, start: Date, end: Date): EnvironmentalReading[] {
    return this.readings()
      .filter(reading => reading.officeId === officeId && reading.measurement.metricType === metricType)
      .filter(reading => {
        const date = new Date(reading.recordedAt);
        return date >= start && date <= end;
      })
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  }

  thresholdFor(metricType: MetricType): MetricThreshold | undefined {
    return this.thresholds().find(threshold => threshold.metricType === metricType);
  }

  createOffice(props: { name: string; building: string; floor: string; reference: string }): void {
    const duplicate = this.offices().some(office => office.name.toLowerCase() === props.name.trim().toLowerCase());
    if (duplicate) {
      this.errorSignal.set('wellbeing.office-dialog.duplicate');
      throw new Error('DUPLICATE');
    }
    const location = new OfficeLocation({building: props.building, floor: props.floor, reference: props.reference});
    const payload: Omit<OfficeResource, 'id'> = {
      name: props.name.trim(),
      building: location.building,
      floor: location.floor,
      locationReference: location.reference,
      active: true
    };
    this.mutate(() => this.api.createOffice(payload), created => {
      this.officesSignal.update(items => [...items, this.officeFromResource(created)]);
    });
  }

  updateOffice(office: Office): void {
    const resource: OfficeResource = {
      id: office.id,
      name: office.name,
      building: office.location.building,
      floor: office.location.floor,
      locationReference: office.location.reference,
      active: office.active
    };
    this.mutate(() => this.api.updateOffice(resource), updated => {
      this.officesSignal.update(items => items.map(current => current.id === updated.id ? this.officeFromResource(updated) : current));
    });
  }

  createAndLinkDevice(code: string, metrics: MetricType[], officeId: number): void {
    const normalized = code.trim().toUpperCase();
    if (this.devices().some(device => device.code.value === normalized)) throw new Error('DUPLICATE_DEVICE');
    const payload: Omit<DeviceResource, 'id'> = {
      code: normalized,
      officeId,
      supportedMetrics: metrics,
      status: 'LINKED'
    };
    this.mutate(() => this.api.createDevice(payload), created => {
      const device = this.deviceFromResource(created);
      this.devicesSignal.update(items => [...items, device]);
      this.reconnectDevices();
    });
  }

  linkDevice(device: Device, officeId: number): void {
    const existingOwner = this.devices().find(current => current.id === device.id)?.officeId;
    if (device.status === 'LINKED' && existingOwner !== officeId) {
      this.errorSignal.set('wellbeing.device-dialog.already-linked');
      throw new Error('DEVICE_LINKED');
    }
    const updated = this.devicePayload(device, officeId, 'LINKED');
    this.mutate(() => this.api.updateDevice(updated), resource => {
      this.devicesSignal.update(items => items.map(current => current.id === resource.id ? this.deviceFromResource(resource) : current));
      this.reconnectDevices();
    });
  }

  unlinkDevice(device: Device): void {
    const updated = this.devicePayload(device, null, 'IN_INVENTORY');
    this.mutate(() => this.api.updateDevice(updated), resource => {
      this.devicesSignal.update(items => items.map(current => current.id === resource.id ? this.deviceFromResource(resource) : current));
      this.reconnectDevices();
    });
  }

  updateThreshold(id: number, ranges: {indicator: HealthIndicator; minValue: number; maxValue: number}[]): void {
    const threshold = this.thresholds().find(item => item.id === id);
    if (!threshold) throw new Error('THRESHOLD_NOT_FOUND');
    const updatedThreshold = new MetricThreshold(id, threshold.metricType,
      ranges.map(range => new ThresholdRange(range)));
    const resources = ranges.map(range => ({
      healthIndicator: range.indicator,
      minValue: range.minValue,
      maxValue: range.maxValue
    }));
    this.mutate(() => this.api.updateThresholdRanges(id, resources), () => {
      this.thresholdsSignal.update(items => items.map(current => current.id === id ? updatedThreshold : current));
    });
  }

  isStale(officeId: number): boolean {
    const readings = this.readings().filter(reading => reading.officeId === officeId);
    return readings.length > 0 && !readings.some(reading => reading.isRecent(6));
  }

  private mutate<T>(request: () => import('rxjs').Observable<T>, onSuccess: (value: T) => void): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    request().pipe(retry(2)).subscribe({
      next: value => {
        onSuccess(value);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(error instanceof Error ? error.message : 'wellbeing.errors.generic');
        this.loadingSignal.set(false);
      }
    });
  }

  private reconnectDevices(): void {
    const devices = this.devices();
    const byOffice = new Map<number, Device[]>();
    devices.forEach(device => {
      if (device.officeId !== null) {
        const list = byOffice.get(device.officeId) ?? [];
        list.push(device);
        byOffice.set(device.officeId, list);
      }
    });
    const offices = this.offices().map(office => new Office({
      id: office.id,
      name: office.name,
      location: office.location,
      active: office.active,
      devices: byOffice.get(office.id) ?? []
    }));
    this.officesSignal.set(offices);
  }

  private worstIndicator(indicators: HealthIndicator[]): HealthIndicator | 'NO_DATA' {
    if (indicators.length === 0) return 'NO_DATA';
    const priority: Record<HealthIndicator, number> = {OPTIMAL: 1, ACCEPTABLE: 2, POOR: 3, HAZARDOUS: 4};
    return indicators.reduce((worst, current) => priority[current] > priority[worst] ? current : worst, indicators[0]);
  }

  private defaultValue(metric: MetricType): number {
    return metric === 'TEMPERATURE' ? 0 : 1;
  }

  private officeFromResource(resource: OfficeResource): Office {
    return new Office({
      id: resource.id,
      name: resource.name,
      location: new OfficeLocation({building: resource.building, floor: resource.floor, reference: resource.locationReference}),
      active: resource.active
    });
  }

  private deviceFromResource(resource: DeviceResource): Device {
    return new Device({
      id: resource.id,
      code: new DeviceCode(resource.code),
      supportedMetrics: new Set(resource.supportedMetrics),
      status: resource.status,
      officeId: resource.officeId
    });
  }

  private devicePayload(device: Device, officeId: number | null, status: DeviceResource['status']): DeviceResource {
    return {id: device.id, code: device.code.value, officeId, supportedMetrics: [...device.supportedMetrics], status};
  }

  private toOffices(resources: OfficeResource[]): Office[] { return resources.map(resource => this.officeFromResource(resource)); }
  private toDevices(resources: DeviceResource[]): Device[] { return resources.map(resource => this.deviceFromResource(resource)); }

  private toReadings(resources: ReadingResource[]): EnvironmentalReading[] {
    return resources.map(resource => new EnvironmentalReading({
      id: resource.id,
      officeId: resource.officeId,
      deviceId: resource.deviceId,
      measurement: new MetricValue(resource.metricType, resource.metricValue),
      recordedAt: resource.recordedAt
    }));
  }

  private toThresholds(thresholds: ThresholdResource[], ranges: ThresholdRangeResource[]): MetricThreshold[] {
    return thresholds.map(threshold => new MetricThreshold(threshold.id, threshold.metricType,
      ranges.filter(range => range.metricThresholdId === threshold.id).map(range => new ThresholdRange({
        indicator: range.healthIndicator,
        minValue: range.minValue,
        maxValue: range.maxValue
      }))));
  }
}

