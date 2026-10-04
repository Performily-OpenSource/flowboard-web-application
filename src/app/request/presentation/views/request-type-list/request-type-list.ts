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

/**
 * View of the request types (US27): the list with its rules and status, and the detail of the selected
 * type with the options to activate, deactivate or delete it.
 *
 * @author Diego Alonso Diaz Villalba
 */
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

  /** Columns of the table. */
  readonly columns = ['name', 'attachment', 'deduction', 'fields', 'status'];
  /** Selected request type, or null to select the first one. */
  readonly selectedId = signal<number | null>(null);
  /** Type that could not be deleted because it has requests, or null. */
  readonly typeInUse = signal<RequestType | null>(null);

  /** Request type whose detail is shown. */
  readonly selectedType = computed(() => {
    const types = this.store.requestTypes();
    return types.find(type => type.id === this.selectedId()) ?? types.at(0) ?? null;
  });

  /**
   * Creates the view and clears the previous error of the store.
   *
   * @author Diego Alonso Diaz Villalba
   */
  constructor() {
    this.store.clearError();
  }

  /**
   * Selects a request type to show its detail.
   *
   * @param type - The request type.
   * @author Diego Alonso Diaz Villalba
   */
  select(type: RequestType) {
    this.selectedId.set(type.id);
    this.typeInUse.set(null);
    this.store.clearError();
  }

  /**
   * Activates or deactivates a request type.
   *
   * @param type - The request type.
   * @author Diego Alonso Diaz Villalba
   */
  toggleStatus(type: RequestType) {
    this.typeInUse.set(null);
    this.store.toggleRequestTypeStatus(type);
  }

  /**
   * Deletes a request type, or shows a warning when it has requests.
   *
   * @param type - The request type.
   * @author Diego Alonso Diaz Villalba
   */
  delete(type: RequestType) {
    if (this.store.deleteRequestType(type)) {
      this.selectedId.set(null);
      this.typeInUse.set(null);
    } else {
      this.typeInUse.set(type);
    }
  }

  /**
   * Deactivates a type that could not be deleted.
   *
   * @param type - The request type.
   * @author Diego Alonso Diaz Villalba
   */
  deactivateInstead(type: RequestType) {
    this.store.clearError();
    this.typeInUse.set(null);
    if (type.active) this.store.toggleRequestTypeStatus(type);
  }
}
