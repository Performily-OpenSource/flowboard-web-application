import {Component, computed, effect, inject, signal} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {CurrentEmployeeStore} from '../../../../shared/application/current-employee.store';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {EMPLOYEE_FILE_SECTIONS} from '../../../../shared/presentation/components/employee-file-section/employee-file-section';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';
import {JobAssignmentHistory} from '../../components/job-assignment-history/job-assignment-history';
import {EmployeeDocumentTable} from '../../components/employee-document-table/employee-document-table';

/** Tabs of the profile view. */
type ProfileTab = 'data' | 'contract' | 'documents';

/**
 * My profile view (WA-11).
 *
 * Lets a collaborator read their own personal data, contract and documents (US18, US19).
 * The current employee comes from CurrentEmployeeStore until the IAM bounded context exists.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-my-profile',
  imports: [
    NgComponentOutlet,
    RouterLink,
    MatButton,
    MatIcon,
    MatProgressBar,
    TranslatePipe,
    LocalDatePipe,
    JobAssignmentHistory,
    EmployeeDocumentTable
  ],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile {
  /** Workspace store that provides the employee, job assignments and documents. */
  readonly store = inject(WorkspaceStore);
  /** Store that identifies the employee using the application. */
  private currentEmployee = inject(CurrentEmployeeStore);

  /** The active tab. */
  readonly tab = signal<ProfileTab>('data');

  /** The current employee, or undefined while it is not loaded. */
  readonly employee = computed(() => this.store.getEmployeeById(this.currentEmployee.employeeId())());

  /** The direct manager of the current employee, or undefined if none is assigned. */
  readonly directManager = computed(() => {
    const managerId = this.employee()?.directManagerId;
    return managerId ? this.store.getEmployeeById(managerId)() : undefined;
  });

  /** Sections registered by other bounded contexts for the 'employment' slot, in display order. */
  readonly employmentSections = (inject(EMPLOYEE_FILE_SECTIONS, { optional: true }) ?? [])
    .filter(section => section.slot === 'employment')
    .sort((a, b) => a.order - b.order);

  /** Loads the job assignments and documents of the current employee whenever it changes. */
  constructor() {
    effect(() => {
      this.store.clearError();
      this.store.loadEmployeeRecords(this.currentEmployee.employeeId());
    });
  }

  /**
   * Builds the initials of an employee for the avatar.
   *
   * @param employee - The employee.
   * @returns The uppercase initials of the first and last name
   * @author Oscar Lizandro Vasquez Llave
   */
  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }
}