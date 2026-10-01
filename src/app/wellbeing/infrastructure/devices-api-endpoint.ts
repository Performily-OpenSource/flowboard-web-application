import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Device} from '../domain/model/device.entity';
import {DeviceResource, DevicesResponse} from './devices-response';
import {DeviceAssembler} from './device-assembler';

export class DevicesApiEndpoint extends BaseApiEndpoint<Device, DeviceResource, DevicesResponse, DeviceAssembler> {
  constructor(http: HttpClient) { super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderDevicesEndpointPath}`, new DeviceAssembler()); }
  createResource(resource: Omit<DeviceResource, 'id'>): Observable<Device> {
    return this.http.post<DeviceResource>(this.endpointUrl, resource).pipe(map(created => this.assembler.toEntityFromResource(created)));
  }
}
