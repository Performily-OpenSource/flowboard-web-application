import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface IamEmployee {
  id: number;
  fullName: string;
  email: string;
  status: string;
}

@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  private readonly endpoint = `${environment.platformProviderApiBaseUrl}${environment.platformProviderEmployeesEndpointPath}`;

  constructor(private readonly http: HttpClient) {}

  getEmployees(): Observable<IamEmployee[]> {
    return this.http.get<Array<{id: number; firstName: string; lastName: string; email: string; status: string}>>(this.endpoint)
      .pipe(map(employees => employees.map(employee => ({
        id: employee.id,
        fullName: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        status: employee.status
      }))));
  }
}
