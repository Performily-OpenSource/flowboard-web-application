import {Component, input, OnInit, output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RoleType} from '../../../domain/model/role.entity';

/**
 * Presents the dialog used to change an employee account role.
 *
 * @remarks Maintains the selected role and emits the requested role change to the parent account-management view.
 * @author Dario Avila de la cruz
 */
@Component({
  selector: 'app-role-dialog',
  imports: [MatButton, MatIcon, TranslatePipe],
  templateUrl: './role-dialog.html',
  styleUrl: './role-dialog.css'
})
export class RoleDialog implements OnInit {
  readonly employeeName = input.required<string>();
  readonly username = input.required<string>();
  readonly currentRole = input.required<RoleType>();
  readonly remainingHr = input.required<number>();
  readonly close = output<void>();
  readonly save = output<RoleType>();
  role: RoleType = 'EMPLOYEE';

/**
 * Initializes the component state from its current input values.
 * @author Dario Avila de la cruz
 */
  ngOnInit(): void { this.role = this.currentRole(); }
/**
 * Updates the role selected in the dialog.
 *
 * @param role the role to assign or select.
 * @author Dario Avila de la cruz
 */
  setRole(role: RoleType): void { this.role = role; }
/**
 * Performs the effectiveRole operation.
 *
 * @returns The role currently selected in the dialog.
 * @author Dario Avila de la cruz
 */
  get effectiveRole(): RoleType { return this.role; }
/**
 * Builds the initials used to represent the employee in the user interface.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  initials(): string { return this.employeeName().split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase(); }
}
