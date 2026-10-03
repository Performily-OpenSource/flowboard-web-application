import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

/**
 * Defines the employee information consumed by IAM from the Workspace bounded context.
 *
 * @remarks Represents the minimal employee data required by IAM account-management operations.
 * @author Dario Avila de la cruz
 */
export interface IamEmployee {
  id: number;
  fullName: string;
  email: string;
  status: string;
}

/**
 * Provides IAM access to employee information owned by Workspace.
 *
 * @remarks Implements the anti-corruption access used by IAM to consume employee data without owning the Workspace model.
 * @author Dario Avila de la cruz
 */
@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  private readonly endpoint = `${environment.platformProviderApiBaseUrl}${environment.platformProviderEmployeesEndpointPath}`;

/**
 * Performs the constructor operation.
 * @author Dario Avila de la cruz
 */
  constructor(private readonly http: HttpClient) {}

/**
 * Retrieves employee information required by the bounded context from Workspace.
 *
 * @returns The value produced by the `getEmployees` operation.
 * @author Dario Avila de la cruz
 */
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
