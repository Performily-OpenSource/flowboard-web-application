import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {MetricType} from './metric-type';
import {HealthIndicator} from './health-indicator';
import {ThresholdRange} from './threshold-range.entity';

export class MetricThreshold implements BaseEntity {
  readonly id: number;
  readonly metricType: MetricType;
  private _ranges: ThresholdRange[] = [];

  constructor(id: number, metricType: MetricType, ranges: ThresholdRange[]) {
    this.id = id;
    this.metricType = metricType;

    if (ranges.length > 0) {
      this.redefineRanges(ranges);
    }
  }

  get ranges(): ThresholdRange[] {
    return [...this._ranges];
  }

  redefineRanges(ranges: ThresholdRange[]): void {
    if (ranges.length !== 4) {
      throw new Error('A metric requires exactly four health ranges.');
    }

    const seen = new Set<HealthIndicator>();
    const ordered = [...ranges].sort((a, b) => a.minValue - b.minValue);

    for (const range of ordered) {
      if (seen.has(range.indicator)) {
        throw new Error('There can be only one range per health indicator.');
      }
      seen.add(range.indicator);
    }

    for (let i = 1; i < ordered.length; i++) {
      const previous = ordered[i - 1];
      const current = ordered[i];

      if (current.minValue < previous.maxValue) {
        throw new Error('Threshold ranges cannot overlap.');
      }

      if (Math.abs(current.minValue - previous.maxValue) > 0.000001) {
        throw new Error('Threshold ranges must be contiguous with no gaps.');
      }
    }

    this._ranges = ordered;
  }

  classify(measurement: import('./metric-value').MetricValue): HealthIndicator {
    if (measurement.metricType !== this.metricType) {
      throw new Error('Metric type mismatch.');
    }

    const match = this._ranges.find(range => range.contains(measurement.value));
    if (!match) {
      throw new Error('The measurement is outside the configured threshold range.');
    }

    return match.indicator;
  }
}
