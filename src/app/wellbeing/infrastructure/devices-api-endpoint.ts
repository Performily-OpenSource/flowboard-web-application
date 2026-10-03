import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Device} from '../domain/model/device.entity';
import {DeviceResource, DevicesResponse} from './devices-response';
import {DeviceAssembler} from './device-assembler';

/**
 * Encapsulates HTTP endpoints related to devices.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class DevicesApiEndpoint extends BaseApiEndpoint<Device, DeviceResource, DevicesResponse, DeviceAssembler> {
/**
 * Initializes the instance with the data required for operation.
 * @param http Parameter used by the operation.
 * @author Diana Li
 */
  constructor(http: HttpClient) { super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderDevicesEndpointPath}`, new DeviceAssembler()); }
/**
 * Executes the createResource operation of the component.
 * @param resource Parameter used by the operation.
 * @author Diana Li
 */
  createResource(resource: Omit<DeviceResource, 'id'>): Observable<Device> {
    return this.http.post<DeviceResource>(this.endpointUrl, resource).pipe(map(created => this.assembler.toEntityFromResource(created)));
  }
}
