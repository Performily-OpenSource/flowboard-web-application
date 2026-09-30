import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {RequestStore} from '../../../application/request.store';
import {RequestType} from '../../../domain/model/request-type.entity';

@Component({
  selector: 'app-request-type-list',
  imports: [
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    TranslatePipe
  ],
  templateUrl: './request-type-list.html',
  styleUrl: './request-type-list.css',
})
export class RequestTypeList {
  readonly store = inject(RequestStore);

  readonly columns = ['name', 'attachment', 'deduction', 'fields', 'status'];
  readonly selectedId = signal<number | null>(null);
  readonly typeInUse = signal<RequestType | null>(null);

  readonly selectedType = computed(() => {
    const types = this.store.requestTypes();
    return types.find(type => type.id === this.selectedId()) ?? types.at(0) ?? null;
  });

  constructor() {
    this.store.clearError();
  }

  select(type: RequestType) {
    this.selectedId.set(type.id);
    this.typeInUse.set(null);
    this.store.clearError();
  }

  toggleStatus(type: RequestType) {
    this.typeInUse.set(null);
    this.store.toggleRequestTypeStatus(type);
  }

  delete(type: RequestType) {
    if (this.store.deleteRequestType(type)) {
      this.selectedId.set(null);
      this.typeInUse.set(null);
    } else {
      this.typeInUse.set(type);
    }
  }

  deactivateInstead(type: RequestType) {
    this.store.clearError();
    this.typeInUse.set(null);
    if (type.active) this.store.toggleRequestTypeStatus(type);
  }
}
