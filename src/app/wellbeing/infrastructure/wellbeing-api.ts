import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, map, Observable, switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DeviceResource, OfficeResource, ReadingResource, ThresholdRangeResource, ThresholdResource} from '../domain/model/wellbeing.model';

@Injectable({providedIn: 'root'})
export class WellbeingApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.platformProviderApiBaseUrl;

  getOffices(): Observable<OfficeResource[]> {
    return this.http.get<OfficeResource[]>(`${this.base}/offices`);
  }

  createOffice(resource: Omit<OfficeResource, 'id'>): Observable<OfficeResource> {
    return this.http.post<OfficeResource>(`${this.base}/offices`, resource);
  }

  updateOffice(resource: OfficeResource): Observable<OfficeResource> {
    return this.http.put<OfficeResource>(`${this.base}/offices/${resource.id}`, resource);
  }

  getDevices(): Observable<DeviceResource[]> {
    return this.http.get<DeviceResource[]>(`${this.base}/devices`);
  }

  createDevice(resource: Omit<DeviceResource, 'id'>): Observable<DeviceResource> {
    return this.http.post<DeviceResource>(`${this.base}/devices`, resource);
  }

  updateDevice(resource: DeviceResource): Observable<DeviceResource> {
    return this.http.put<DeviceResource>(`${this.base}/devices/${resource.id}`, resource);
  }

  getReadings(): Observable<ReadingResource[]> {
    return this.http.get<ReadingResource[]>(`${this.base}/environmental-readings`);
  }

  getThresholds(): Observable<ThresholdResource[]> {
    return this.http.get<ThresholdResource[]>(`${this.base}/metric-thresholds`);
  }

  getThresholdRanges(): Observable<ThresholdRangeResource[]> {
    return this.http.get<ThresholdRangeResource[]>(`${this.base}/threshold-ranges`);
  }

  updateThreshold(threshold: ThresholdResource): Observable<ThresholdResource> {
    return this.http.put<ThresholdResource>(`${this.base}/metric-thresholds/${threshold.id}`, threshold);
  }

  updateThresholdRanges(thresholdId: number, ranges: Array<Pick<ThresholdRangeResource, 'healthIndicator' | 'minValue' | 'maxValue'>>): Observable<ThresholdRangeResource[]> {
    return this.getThresholdRanges().pipe(
      map(resources => resources.filter(resource => resource.metricThresholdId === thresholdId).sort((a, b) => a.minValue - b.minValue)),
      switchMap(current => {
        if (current.length !== ranges.length) {
          throw new Error('La configuración de umbrales no tiene el número esperado de rangos.');
        }
        return forkJoin(current.map((resource, index) => this.http.put<ThresholdRangeResource>(`${this.base}/threshold-ranges/${resource.id}`, {
          ...resource,
          healthIndicator: ranges[index].healthIndicator,
          minValue: ranges[index].minValue,
          maxValue: ranges[index].maxValue
        })));
      })
    );
  }
}
