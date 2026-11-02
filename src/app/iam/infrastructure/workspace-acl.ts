import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

/** Minimal employee view the IAM context needs from Workspace. */
export interface IamEmployee {
  id: number;
  fullName: string;
  email: string;
  status: string;
}

interface WorkspaceEmployeeResource {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

/**
 * Anti-corruption layer between IAM and Workspace.
 *
 * @remarks Reads employees from the real Flowboard Web Service (same ids the accounts reference).
 */
@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  private readonly endpoint = `${environment.webServiceApiBaseUrl}/employees`;

  constructor(private readonly http: HttpClient) {}

  getEmployees(): Observable<IamEmployee[]> {
    return this.http.get<WorkspaceEmployeeResource[]>(this.endpoint).pipe(map(list => list.map(toEmployee)));
  }

  getEmployee(id: number): Observable<IamEmployee> {
    return this.http.get<WorkspaceEmployeeResource>(`${this.endpoint}/${id}`).pipe(map(toEmployee));
  }
}

function toEmployee(employee: WorkspaceEmployeeResource): IamEmployee {
  return {
    id: employee.id,
    fullName: `${employee.firstName} ${employee.lastName}`,
    email: employee.email,
    status: employee.status
  };
}
