import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Office} from '../domain/model/office.entity';
import {OfficeLocation} from '../domain/model/office-location';
import {Device} from '../domain/model/device.entity';
import {DeviceCode} from '../domain/model/device-code';
import {EnvironmentalReading} from '../domain/model/environmental-reading.entity';
import {MetricValue} from '../domain/model/metric-value';
import {MetricType} from '../domain/model/metric-type';
import {MetricThreshold} from '../domain/model/metric-threshold.entity';
import {ThresholdRange} from '../domain/model/threshold-range.entity';
import {OfficeResource} from './offices-response';
import {DeviceResource} from './devices-response';
import {ThresholdRangeResource} from './threshold-ranges-response';
type ApiDevice = DeviceResource & {
  lastReadingAt?: string | null;
};

type ApiOffice = {
  id: number;
  name: string;
  area: string | null;
  address: string;
  floor: string;
  reference: string | null;
  active: boolean;
  devices?: ApiDevice[];
};

type ApiRange = {
  indicator: ThresholdRangeResource['healthIndicator'];
  minValue: number;
  maxValue: number;
};

type ApiThreshold = {
  id: number;
  officeId: number;
  metricType: MetricType;
  ranges: ApiRange[];
};

type ApiReading = {
  id: number;
  officeId: number;
  deviceId: number;
  metricType: MetricType;
  value: number;
  recordedAt: string;
};

type ApiHistory = {
  readings: ApiReading[];
};

@Injectable({ providedIn: 'root' })
export class WellbeingApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.webServiceApiBaseUrl.replace(/\/$/, '')}`;
  private readonly metrics: MetricType[] = ['TEMPERATURE', 'ILLUMINATION', 'AIR_QUALITY'];

  readonly thresholdOffices = new Map<number, number>();

  private office(r: ApiOffice): Office {
    return new Office({
      id: r.id,
      name: r.name,
      location: new OfficeLocation({
        building: r.address,
        floor: r.floor,
        reference: r.reference ?? ''
      }),
      active: r.active
    });
  }

  private device(r: ApiDevice): Device {
    return new Device({
      id: r.id,
      code: new DeviceCode(r.code),
      officeId: r.officeId ?? null,
      supportedMetrics: new Set(r.supportedMetrics),
      status: r.status
    });
  }

  private threshold(r: ApiThreshold): MetricThreshold {
    return new MetricThreshold(
      r.id,
      r.metricType,
      r.ranges.map((v, i) => new ThresholdRange({
        id: r.id * 10 + i + 1,
        metricThresholdId: r.id,
        indicator: v.indicator,
        minValue: v.minValue,
        maxValue: v.maxValue
      }))
    );
  }

  getOffices(): Observable<Office[]> {
    return this.http.get<ApiOffice[]>(`${this.base}/offices`).pipe(
      map(rows => rows.map(r => this.office(r)))
    );
  }

  createOffice(r: Omit<OfficeResource, 'id'>): Observable<Office> {
    return this.http.post<ApiOffice>(`${this.base}/offices`, {
      name: r.name,
      area: 'General',
      address: r.building,
      floor: r.floor,
      reference: r.locationReference
    }).pipe(
      map(v => this.office(v))
    );
  }

  // The backend does not expose PUT /offices/{id}; never silently claim an update succeeded.
  updateOffice(_office: Office): Observable<Office> {
    throw new Error('El backend no implementa la edición de oficinas.');
  }

  getDevices(): Observable<Device[]> {
    return this.http.get<ApiDevice[]>(`${this.base}/devices`).pipe(
      map(rows => rows.map(r => this.device(r)))
    );
  }

  createDevice(r: Omit<DeviceResource, 'id'>): Observable<Device> {
    return this.http.post<ApiDevice>(`${this.base}/devices`, {
      code: r.code,
      supportedMetrics: r.supportedMetrics
    }).pipe(
      switchMap(created => 
        r.officeId != null 
          ? this.linkDevice(created.code, r.officeId) 
          : of(this.device(created))
      )
    );
  }

  linkDevice(code: string, officeId: number): Observable<Device> {
    return this.http.post<ApiDevice>(`${this.base}/offices/${officeId}/devices`, {
      deviceCode: code
    }).pipe(
      map(r => this.device(r))
    );
  }

  unlinkDevice(code: string, officeId: number): Observable<Device> {
    return this.http.delete<ApiDevice>(`${this.base}/offices/${officeId}/devices/${encodeURIComponent(code)}`).pipe(
      map(r => this.device(r))
    );
  }

  updateDevice(entity: Device): Observable<Device> {
    return entity.officeId === null
      ? this.getDevices().pipe(
          switchMap(ds => {
            const original = ds.find(d => d.id === entity.id);
            return original?.officeId != null
              ? this.unlinkDevice(entity.code.value, original.officeId)
              : of(entity);
          })
        )
      : this.linkDevice(entity.code.value, entity.officeId);
  }

  getThresholdsForOffice(officeId: number): Observable<MetricThreshold[]> {
    return this.http.get<ApiThreshold[]>(`${this.base}/offices/${officeId}/thresholds`).pipe(
      map(rows => rows.map(r => {
        this.thresholdOffices.set(r.id, r.officeId);
        return this.threshold(r);
      }))
    );
  }

  getThresholds(): Observable<MetricThreshold[]> {
    return this.getOffices().pipe(
      switchMap(offices => offices.length
        ? forkJoin(offices.map(o => this.getThresholdsForOffice(o.id))).pipe(
            map(groups => groups.flat())
          )
        : of([])
      )
    );
  }

  getThresholdRanges(): Observable<ThresholdRange[]> {
    return this.getThresholds().pipe(
      map(ts => ts.flatMap(t => t.ranges))
    );
  }

  updateThresholdRanges(
    officeId: number,
    metricType: MetricType,
    ranges: Array<Pick<ThresholdRangeResource, 'healthIndicator' | 'minValue' | 'maxValue'>>
  ): Observable<MetricThreshold> {
    const payload = {
      ranges: ranges.map(r => ({
        indicator: r.healthIndicator,
        minValue: r.minValue,
        maxValue: r.maxValue
      }))
    };

    return this.http.put<ApiThreshold>(`${this.base}/offices/${officeId}/thresholds/${metricType}`, payload).pipe(
      map(r => this.threshold(r))
    );
  }

  getReadings(): Observable<EnvironmentalReading[]> {
    return this.getOffices().pipe(
      switchMap(offices => offices.length
        ? forkJoin(offices.flatMap(o => this.metrics.map(metric => this.getReadingHistory(o.id, metric)))).pipe(
            map(groups => groups.flat())
          )
        : of([])
      )
    );
  }

  getReadingHistory(officeId: number, metricType: MetricType): Observable<EnvironmentalReading[]> {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 365);

    const date = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const params = new HttpParams()
      .set('metricType', metricType)
      .set('from', date(from))
      .set('to', date(today));

    return this.http.get<ApiHistory>(`${this.base}/offices/${officeId}/readings`, { params }).pipe(
      map(h => (h.readings ?? []).map(r => new EnvironmentalReading({
        id: r.id,
        officeId: r.officeId,
        deviceId: r.deviceId,
        measurement: new MetricValue(r.metricType, r.value),
        recordedAt: r.recordedAt
      })))
    );
  }
}