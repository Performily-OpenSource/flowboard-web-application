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

  selectRole(role: RoleType|null): void { this.roleFilter.set(role); }
  selectStatus(status: 'ACTIVE'|'DISABLED'|null): void { this.statusFilter.set(status); }
  openRole(account: AccountListItem): void { this.selectedAccount.set(account); this.modal.set('role'); }
  openReset(account: AccountListItem): void { this.selectedAccount.set(account); this.modal.set('reset'); }
  closeModal(): void { this.modal.set(null); this.selectedAccount.set(null); }

  async saveRole(role: RoleType): Promise<void> {
    const account = this.selectedAccount();
    if (!account) return;
    const ok = await this.store.changeRole(account.id, role);
    if (ok) this.closeModal();
  }

  async resetCompleted(): Promise<void> { this.closeModal(); }

  initials(account: AccountListItem): string {
    return account.employeeName.split(' ').map(part => part.charAt(0)).slice(0,2).join('').toUpperCase();
  }

  roleLabel(role: RoleType): string { return role === 'HR_STAFF' ? 'iam.role.hr' : 'iam.role.employee'; }

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
