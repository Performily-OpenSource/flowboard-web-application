import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Employee} from '../domain/model/employee.entity';
import {EmployeeResource, EmployeesResponse} from './employees-response';
import {EmployeeAssembler} from './employee-assembler';

export class EmployeesApiEndpoint extends BaseApiEndpoint<Employee, EmployeeResource, EmployeesResponse, EmployeeAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderEmployeesEndpointPath}`, new EmployeeAssembler());
  }
}
