import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, switchMap} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Office} from '../domain/model/office.entity';
import {Device} from '../domain/model/device.entity';
import {EnvironmentalReading} from '../domain/model/environmental-reading.entity';
import {MetricThreshold} from '../domain/model/metric-threshold.entity';
import {ThresholdRange} from '../domain/model/threshold-range.entity';
import {OfficesApiEndpoint} from './offices-api-endpoint';
import {DevicesApiEndpoint} from './devices-api-endpoint';
import {EnvironmentalReadingsApiEndpoint} from './environmental-readings-api-endpoint';
import {MetricThresholdsApiEndpoint} from './metric-thresholds-api-endpoint';
import {ThresholdRangesApiEndpoint} from './threshold-ranges-api-endpoint';
import {DeviceResource} from './devices-response';
import {OfficeResource} from './offices-response';
import {ThresholdRangeResource} from './threshold-ranges-response';

@Injectable({providedIn: 'root'})
export class WellbeingApi extends BaseApi {
  private readonly offices: OfficesApiEndpoint;
  private readonly devices: DevicesApiEndpoint;
  private readonly readings: EnvironmentalReadingsApiEndpoint;
  private readonly thresholds: MetricThresholdsApiEndpoint;
  private readonly ranges: ThresholdRangesApiEndpoint;

  constructor() {
    super();
    const http = inject(HttpClient);
    this.offices = new OfficesApiEndpoint(http);
    this.devices = new DevicesApiEndpoint(http);
    this.readings = new EnvironmentalReadingsApiEndpoint(http);
    this.thresholds = new MetricThresholdsApiEndpoint(http);
    this.ranges = new ThresholdRangesApiEndpoint(http);
  }

  getOffices(): Observable<Office[]> { return this.offices.getAll(); }
  createOffice(resource: Omit<OfficeResource, 'id'>): Observable<Office> { return this.offices.createResource(resource); }
  updateOffice(entity: Office): Observable<Office> { return this.offices.update(entity, entity.id); }
  getDevices(): Observable<Device[]> { return this.devices.getAll(); }
  createDevice(resource: Omit<DeviceResource, 'id'>): Observable<Device> { return this.devices.createResource(resource); }
  updateDevice(entity: Device): Observable<Device> { return this.devices.update(entity, entity.id); }
  getReadings(): Observable<EnvironmentalReading[]> { return this.readings.getAll(); }
  getThresholds(): Observable<MetricThreshold[]> { return this.thresholds.getAll(); }
  getThresholdRanges(): Observable<ThresholdRange[]> { return this.ranges.getAll(); }
  updateThreshold(entity: MetricThreshold): Observable<MetricThreshold> { return this.thresholds.update(entity, entity.id); }
  updateThresholdRanges(thresholdId: number, ranges: Array<Pick<ThresholdRangeResource, 'healthIndicator' | 'minValue' | 'maxValue'>>): Observable<ThresholdRange[]> {
    return this.ranges.getAll().pipe(
      switchMap(current => {
        const matching = current.filter(item => item.metricThresholdId === thresholdId).sort((a,b) => a.minValue - b.minValue);
        if (matching.length !== ranges.length) throw new Error('wellbeing.thresholds.invalid-count');
        return forkJoin(matching.map((resource, index) => this.ranges.update(
          new ThresholdRange({id: resource.id, metricThresholdId: thresholdId, indicator: ranges[index].healthIndicator, minValue: ranges[index].minValue, maxValue: ranges[index].maxValue}),
          resource.id
        )));
      })
    );
  }
}
