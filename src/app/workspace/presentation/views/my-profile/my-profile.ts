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

type ProfileTab = 'data' | 'contract' | 'documents';

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
  readonly store = inject(WorkspaceStore);
  private currentEmployee = inject(CurrentEmployeeStore);

  readonly tab = signal<ProfileTab>('data');

  readonly employee = computed(() => this.store.getEmployeeById(this.currentEmployee.employeeId())());

  readonly directManager = computed(() => {
    const managerId = this.employee()?.directManagerId;
    return managerId ? this.store.getEmployeeById(managerId)() : undefined;
  });

  readonly employmentSections = (inject(EMPLOYEE_FILE_SECTIONS, { optional: true }) ?? [])
    .filter(section => section.slot === 'employment')
    .sort((a, b) => a.order - b.order);

  constructor() {
    effect(() => {
      this.store.clearError();
      this.store.loadEmployeeRecords(this.currentEmployee.employeeId());
    });
  }

  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }
}