import {Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';

/**
 * Application store with the employee who uses the collaborator views ("My profile", "My requests"...).
 *
 * @remarks Starts with environment.defaultActingEmployeeId; after sign-in, IAM sets the employeeId of the user account.
 * @author Oscar Lizandro Vasquez Llave
 */
@Injectable({providedIn: 'root'})
export class CurrentEmployeeStore {
  /** Id of the current employee. */
  private readonly employeeIdSignal = signal<number>(environment.defaultActingEmployeeId);
  /** Read-only id of the current employee. */
  readonly employeeId = this.employeeIdSignal.asReadonly();

  /**
   * Changes the current employee.
   *
   * @param employeeId - Id of the employee who uses the application.
   * @author Oscar Lizandro Vasquez Llave
   */
  setEmployeeId(employeeId: number): void {
    this.employeeIdSignal.set(employeeId);
  }
}