import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore, AccountListItem} from '../../../application/iam.store';
import {RoleType} from '../../../domain/model/role.entity';
import {RoleDialog} from '../../components/role-dialog/role-dialog';
import {ResetPasswordDialog} from '../../components/reset-password-dialog/reset-password-dialog';

/**
 * Presents the IAM account-management list for authorized users.
 *
 * @remarks Provides account filtering, role changes, password resets and CSV export actions.
 * @author Dario Avila de la cruz
 */
@Component({
  selector:'app-account-list',
  imports:[MatButton,MatIcon,MatMenu,MatMenuItem,MatMenuTrigger,MatProgressBar,TranslatePipe,RoleDialog,ResetPasswordDialog],
  templateUrl:'./account-list.html',
  styleUrl:'./account-list.css'
})
export class AccountList {
  readonly store = inject(IamStore);
  readonly roleFilter = signal<RoleType | null>(null);
  readonly statusFilter = signal<'ACTIVE'|'DISABLED'|null>(null);
  readonly selectedAccount = signal<AccountListItem | null>(null);
  readonly modal = signal<'role'|'reset'|null>(null);
  readonly filteredAccounts = computed(() => this.store.accounts().filter(account =>
    (!this.roleFilter() || account.role === this.roleFilter()) && (!this.statusFilter() || account.status === this.statusFilter())));
  readonly activeHrCount = computed(() => this.store.activeHrCount());

/**
 * Updates the selected role filter.
 *
 * @param role the role to assign or select.
 * @author Dario Avila de la cruz
 */
  selectRole(role: RoleType|null): void { this.roleFilter.set(role); }
/**
 * Updates the selected account-status filter.
 *
 * @param status the attendance status to format or evaluate.
 * @author Dario Avila de la cruz
 */
  selectStatus(status: 'ACTIVE'|'DISABLED'|null): void { this.statusFilter.set(status); }
/**
 * Opens the role-management dialog for the selected account.
 *
 * @param account the account being updated or displayed.
 * @author Dario Avila de la cruz
 */
  openRole(account: AccountListItem): void { this.selectedAccount.set(account); this.modal.set('role'); }
/**
 * Opens the password-reset dialog for the selected account.
 *
 * @param account the account being updated or displayed.
 * @author Dario Avila de la cruz
 */
  openReset(account: AccountListItem): void { this.selectedAccount.set(account); this.modal.set('reset'); }
/**
 * Closes the current account-management dialog and clears the selected account.
 *
 */
  closeModal(): void { this.modal.set(null); this.selectedAccount.set(null); }

/**
 * Persists the selected role for the currently selected account.
 *
 * @param role the role to assign or select.
 * @returns The value produced by the `saveRole` operation.
 * @author Dario Avila de la cruz
 * 
 */
  async saveRole(role: RoleType): Promise<void> {
    const account = this.selectedAccount();
    if (!account) return;
    const ok = await this.store.changeRole(account.id, role);
    if (ok) this.closeModal();
  }

/**
 * Completes the reset-dialog flow and closes the modal.
 *
 * @returns The value produced by the `resetCompleted` operation.
 * @author Dario Avila de la cruz
 */
  async resetCompleted(): Promise<void> { this.closeModal(); }

/**
 * Builds the initials used to represent the employee in the user interface.
 *
 * @param account the account being updated or displayed.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  initials(account: AccountListItem): string {
    return account.employeeName.split(' ').map(part => part.charAt(0)).slice(0,2).join('').toUpperCase();
  }

/**
 * Returns the translation key associated with an account role.
 *
 * @param role the role to assign or select.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  roleLabel(role: RoleType): string { return role === 'HR_STAFF' ? 'iam.role.hr' : 'iam.role.employee'; }

/**
 * Exports the currently filtered accounts as a CSV file.
 * @author Dario Avila de la cruz
 */
  exportAccounts(): void {
    const rows = this.filteredAccounts().map(account => [account.employeeName, account.employeeEmail, account.role, account.status]);
    const csv = [['Employee', 'Username', 'Role', 'Status'], ...rows]
      .map(row => row.map(value => `\"${String(value).replace(/\"/g, '\"\"')}\"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'user-accounts.csv'; link.click(); URL.revokeObjectURL(url);
  }
}
