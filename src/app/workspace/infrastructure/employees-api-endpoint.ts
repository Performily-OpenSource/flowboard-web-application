import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Employee} from '../domain/model/employee.entity';
import {EmployeeResource, EmployeesResponse} from './employees-response';
import {EmployeeAssembler} from './employee-assembler';

/**
 * API endpoint for the Employee resource, targeting the '/employees' REST collection
 * (platformProviderApiBaseUrl + /employees). Inherits CRUD operations from BaseApiEndpoint.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeesApiEndpoint extends BaseApiEndpoint<Employee, EmployeeResource, EmployeesResponse, EmployeeAssembler> {

  /**
   * Creates the endpoint with the /employees URL and an EmployeeAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderEmployeesEndpointPath}`, new EmployeeAssembler());
  }
}
