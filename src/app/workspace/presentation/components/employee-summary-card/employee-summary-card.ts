import {Component, input} from '@angular/core';
import {Employee} from '../../../domain/model/employee.entity';

export interface SummaryRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-employee-summary-card',
  imports: [],
  templateUrl: './employee-summary-card.html',
  styleUrl: './employee-summary-card.css',
})
export class EmployeeSummaryCard {
  readonly employee = input.required<Employee>();
  readonly subtitle = input<string | null>(null);
  readonly rows = input<SummaryRow[]>([]);

  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }
}
