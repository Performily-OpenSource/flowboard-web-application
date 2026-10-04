import {Component, input} from '@angular/core';
import {Employee} from '../../../domain/model/employee.entity';

/** Label and value pair shown in the employee summary card. */
export interface SummaryRow {
  /** Translated label of the row. */
  label: string;
  /** Value displayed for the row. */
  value: string;
}

/**
 * Card that summarizes an employee inside the workspace dialogs.
 * Shows the initials avatar, full name, a subtitle (position and area by default) and optional extra rows.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-employee-summary-card',
  imports: [],
  templateUrl: './employee-summary-card.html',
  styleUrl: './employee-summary-card.css',
})
export class EmployeeSummaryCard {
  /** Employee to summarize. */
  readonly employee = input.required<Employee>();
  /** Custom subtitle; when null the position and area are shown. */
  readonly subtitle = input<string | null>(null);
  /** Extra label and value rows shown below the employee. */
  readonly rows = input<SummaryRow[]>([]);

  /**
   * Gets the initials of an employee for the avatar.
   *
   * @param employee - The employee to get the initials from.
   * @returns The uppercase initials of the first name and last name
   * @author Oscar Lizandro Vasquez Llave
   */
  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }
}
