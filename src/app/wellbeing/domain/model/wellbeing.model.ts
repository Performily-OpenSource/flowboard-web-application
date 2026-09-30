export type MetricType = 'TEMPERATURE' | 'ILLUMINATION' | 'AIR_QUALITY';
export type HealthIndicator = 'OPTIMAL' | 'ACCEPTABLE' | 'POOR' | 'HAZARDOUS';
export type DeviceStatus = 'IN_INVENTORY' | 'LINKED' | 'INACTIVE';

export interface OfficeLocationProps {
  building: string;
  floor: string;
  reference?: string;
}

export class OfficeLocation {
  readonly building: string;
  readonly floor: string;
  readonly reference: string;

  constructor(props: OfficeLocationProps) {
    const building = props.building.trim();
    const floor = props.floor.trim();
    const reference = (props.reference ?? '').trim();
    if (!building || !floor) throw new Error('Building and floor are required.');
    if (reference.length > 150) throw new Error('The location reference is too long.');
    this.building = building;
    this.floor = floor;
    this.reference = reference;
  }
}

export class DeviceCode {
  readonly value: string;

  constructor(value: string) {
    const normalized = value.trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,30}$/.test(normalized)) {
      throw new Error('Device code must contain 4 to 30 uppercase letters, digits or hyphens.');
    }
    this.value = normalized;
  }
}

export class MetricValue {
  readonly metricType: MetricType;
  readonly value: number;

  constructor(metricType: MetricType, value: number) {
    if (!Number.isFinite(value)) throw new Error('Metric value must be numeric.');
    const bounds: Record<MetricType, [number, number]> = {
      TEMPERATURE: [-50, 100],
      ILLUMINATION: [0, 10000],
      AIR_QUALITY: [0, 5000]
    };
    const [min, max] = bounds[metricType];
    if (value < min || value > max) {
      throw new Error(`Value for ${metricType} is outside its physical range.`);
    }
    this.metricType = metricType;
    this.value = value;
  }

  unit(): string {
    return this.metricType === 'TEMPERATURE' ? '°C' : this.metricType === 'ILLUMINATION' ? 'lx' : 'ppm';
  }
}

export interface ThresholdRangeProps {
  indicator: HealthIndicator;
  minValue: number;
  maxValue: number;
}

export class ThresholdRange {
  readonly indicator: HealthIndicator;
  readonly minValue: number;
  readonly maxValue: number;

  constructor(props: ThresholdRangeProps) {
    if (!Number.isFinite(props.minValue) || !Number.isFinite(props.maxValue) || props.maxValue <= props.minValue) {
      throw new Error('A threshold range requires minValue < maxValue.');
    }
    this.indicator = props.indicator;
    this.minValue = props.minValue;
    this.maxValue = props.maxValue;
  }

  contains(value: number): boolean {
    return value >= this.minValue && value <= this.maxValue;
  }

  isContiguousWith(other: ThresholdRange): boolean {
    return Math.abs(this.maxValue - other.minValue) < 0.000001 || Math.abs(other.maxValue - this.minValue) < 0.000001;
  }
}

export class MetricThreshold {
  readonly id: number;
  readonly metricType: MetricType;
  private _ranges: ThresholdRange[];

  constructor(id: number, metricType: MetricType, ranges: ThresholdRange[]) {
    this.id = id;
    this.metricType = metricType;
    this._ranges = [];
    this.redefineRanges(ranges);
  }

  get ranges(): ThresholdRange[] {
    return [...this._ranges];
  }

  redefineRanges(ranges: ThresholdRange[]): void {
    if (ranges.length !== 4) throw new Error('A metric requires exactly four health ranges.');
    const seen = new Set<HealthIndicator>();
    const ordered = [...ranges].sort((a, b) => a.minValue - b.minValue);
    for (const range of ordered) {
      if (seen.has(range.indicator)) throw new Error('There can be only one range per health indicator.');
      seen.add(range.indicator);
    }
    for (let i = 1; i < ordered.length; i++) {
      const previous = ordered[i - 1];
      const current = ordered[i];
      if (current.minValue < previous.maxValue) throw new Error('Threshold ranges cannot overlap.');
      if (Math.abs(current.minValue - previous.maxValue) > 0.000001) throw new Error('Threshold ranges must be contiguous with no gaps.');
    }
    this._ranges = ordered;
  }

  classify(measurement: MetricValue): HealthIndicator {
    if (measurement.metricType !== this.metricType) throw new Error('Metric type mismatch.');
    const match = this._ranges.find(range => range.contains(measurement.value));
    if (!match) throw new Error('The measurement is outside the configured threshold range.');
    return match.indicator;
  }
}

export class Device {
  readonly id: number;
  readonly code: DeviceCode;
  readonly supportedMetrics: Set<MetricType>;
  status: DeviceStatus;
  officeId: number | null;

  constructor(props: { id: number; code: DeviceCode; supportedMetrics: Set<MetricType>; status: DeviceStatus; officeId?: number | null }) {
    if (props.supportedMetrics.size === 0) throw new Error('A device must support at least one metric.');
    this.id = props.id;
    this.code = props.code;
    this.supportedMetrics = new Set(props.supportedMetrics);
    this.status = props.status;
    this.officeId = props.officeId ?? null;
  }

  canSendReadings(): boolean {
    return this.status === 'LINKED' && this.officeId !== null;
  }

  supports(metricType: MetricType): boolean {
    return this.supportedMetrics.has(metricType);
  }
}

export class Office {
  readonly id: number;
  readonly name: string;
  readonly location: OfficeLocation;
  active: boolean;
  readonly devices: Device[];

  constructor(props: { id: number; name: string; location: OfficeLocation; active: boolean; devices?: Device[] }) {
    const name = props.name.trim();
    if (!name) throw new Error('Office name is required.');
    if (name.length > 80) throw new Error('Office name cannot exceed 80 characters.');
    this.id = props.id;
    this.name = name;
    this.location = props.location;
    this.active = props.active;
    this.devices = [...(props.devices ?? [])];
  }

  linkDevice(device: Device): void {
    if (!this.active) throw new Error('An inactive office cannot receive devices.');
    if (device.status === 'LINKED' && device.officeId !== this.id) {
      throw new Error('The device is already linked to another office.');
    }
    if (device.status === 'INACTIVE') throw new Error('Inactive devices cannot be linked.');
    device.status = 'LINKED';
    device.officeId = this.id;
    if (!this.devices.some(current => current.id === device.id)) this.devices.push(device);
  }

  unlinkDevice(device: Device): void {
    if (device.officeId !== this.id) return;
    device.officeId = null;
    device.status = 'IN_INVENTORY';
    const index = this.devices.findIndex(current => current.id === device.id);
    if (index >= 0) this.devices.splice(index, 1);
  }

  deactivate(): void {
    this.active = false;
  }
}

export class EnvironmentalReading {
  readonly id: number;
  readonly officeId: number;
  readonly deviceId: number;
  readonly measurement: MetricValue;
  readonly recordedAt: string;

  constructor(props: { id: number; officeId: number; deviceId: number; measurement: MetricValue; recordedAt: string }) {
    this.id = props.id;
    this.officeId = props.officeId;
    this.deviceId = props.deviceId;
    this.measurement = props.measurement;
    this.recordedAt = props.recordedAt;
  }

  isRecent(validityHours: number): boolean {
    const timestamp = new Date(this.recordedAt).getTime();
    return Number.isFinite(timestamp) && Date.now() - timestamp <= validityHours * 60 * 60 * 1000;
  }

  classify(threshold: MetricThreshold): HealthIndicator {
    return threshold.classify(this.measurement);
  }
}

export interface OfficeResource {
  id: number;
  name: string;
  building: string;
  floor: string;
  locationReference: string;
  active: boolean;
}

export interface DeviceResource {
  id: number;
  code: string;
  officeId: number | null;
  supportedMetrics: MetricType[];
  status: DeviceStatus;
}

export interface ReadingResource {
  id: number;
  officeId: number;
  deviceId: number;
  metricType: MetricType;
  metricValue: number;
  recordedAt: string;
}

export interface ThresholdRangeResource {
  id: number;
  metricThresholdId: number;
  healthIndicator: HealthIndicator;
  minValue: number;
  maxValue: number;
}

export interface ThresholdResource {
  id: number;
  metricType: MetricType;
}
