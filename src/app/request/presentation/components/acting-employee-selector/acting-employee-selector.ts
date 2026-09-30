import {Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';

@Component({
  selector: 'app-acting-employee-selector',
  imports: [MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, MatTooltip, TranslatePipe],
  templateUrl: './acting-employee-selector.html',
  styleUrl: './acting-employee-selector.css',
})
export class ActingEmployeeSelector {
  readonly store = inject(RequestStore);
}
