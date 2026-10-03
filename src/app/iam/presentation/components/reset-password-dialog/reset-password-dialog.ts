import {Component, inject, input, output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';

/**
 * Presents the dialog used to reset an employee account password.
 *
 * @remarks Coordinates the reset-password action and displays account information required for the confirmation flow.
 * @author Dario Avila de la cruz
 */
@Component({selector:'app-reset-password-dialog',imports:[MatButton,MatIcon,TranslatePipe],templateUrl:'./reset-password-dialog.html',styleUrl:'./reset-password-dialog.css'})
export class ResetPasswordDialog {
  readonly accountId = input.required<number>();
  readonly employeeName = input.required<string>();
  readonly username = input.required<string>();
  readonly status = input.required<string>();
  readonly lastSignInAt = input<string|null>(null);
  readonly close = output<void>();
  readonly completed = output<void>();
  private readonly iam = inject(IamStore);

/**
 * Formats the account last sign-in timestamp for display.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  lastSignIn(): string {
    const value = this.lastSignInAt();
    return value ? new Intl.DateTimeFormat('es-PE', {dateStyle: 'short', timeStyle: 'short'}).format(new Date(value)) : '';
  }

/**
 * Builds the initials used to represent the employee in the user interface.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  initials(): string { return this.employeeName().split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase(); }

/**
 * Requests a password reset for the selected account and closes the dialog when completed.
 *
 * @returns The value produced by the `reset` operation.
 * @author Dario Avila de la cruzs
 */
  async reset(): Promise<void> {
    if (await this.iam.resetPassword(this.accountId())) this.completed.emit();
  }
}
