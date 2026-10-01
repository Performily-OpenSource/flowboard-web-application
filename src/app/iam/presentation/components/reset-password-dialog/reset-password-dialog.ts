import {Component, inject, input, output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';

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

  lastSignIn(): string {
    const value = this.lastSignInAt();
    return value ? new Intl.DateTimeFormat('es-PE', {dateStyle: 'short', timeStyle: 'short'}).format(new Date(value)) : '';
  }

  initials(): string { return this.employeeName().split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase(); }

  async reset(): Promise<void> {
    if (await this.iam.resetPassword(this.accountId())) this.completed.emit();
  }
}
