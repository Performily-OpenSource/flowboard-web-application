import {Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class CurrentEmployeeStore {
  private readonly employeeIdSignal = signal<number>(environment.defaultActingEmployeeId);
  readonly employeeId = this.employeeIdSignal.asReadonly();

  setEmployeeId(employeeId: number): void {
    this.employeeIdSignal.set(employeeId);
  }
}