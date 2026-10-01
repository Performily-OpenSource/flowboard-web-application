import {Component, input, OnInit, output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RoleType} from '../../../domain/model/role.entity';

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

  ngOnInit(): void { this.role = this.currentRole(); }
  setRole(role: RoleType): void { this.role = role; }
  get effectiveRole(): RoleType { return this.role; }
  initials(): string { return this.employeeName().split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase(); }
}
