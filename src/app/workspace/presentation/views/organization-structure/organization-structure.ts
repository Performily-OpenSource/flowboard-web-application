import {Component, computed, inject, signal} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressBar} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {WorkspaceStore} from '../../../application/workspace.store';
import {Area} from '../../../domain/model/area.entity';
import {Position} from '../../../domain/model/position.entity';
import {AreaFormDialog} from '../../components/area-form-dialog/area-form-dialog';
import {PositionFormDialog} from '../../components/position-form-dialog/position-form-dialog';

/**
 * Organization structure view (WA-46, WA-47, WA-48).
 *
 * Manages the areas (US09) and the positions of the selected area (US10): create,
 * edit, activate and deactivate.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-organization-structure',
  imports: [
    CurrencyPipe,
    RouterLink,
    RouterLinkActive,
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
    MatNoDataRow,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressBar,
    TranslatePipe
  ],
  templateUrl: './organization-structure.html',
  styleUrl: './organization-structure.css',
})
export class OrganizationStructure {
  /** Workspace store that provides and saves areas and positions. */
  readonly store = inject(WorkspaceStore);
  private dialog = inject(MatDialog);

  /** Columns displayed in the positions table. */
  readonly columns = ['title', 'referenceSalary', 'active', 'actions'];

  /** Id of the area chosen by the user; null until one is chosen. */
  private readonly selectedAreaIdSignal = signal<number | null>(null);

  /** The selected area, defaulting to the first area. */
  readonly selectedArea = computed<Area | undefined>(() => {
    const areas = this.store.areas();
    return areas.find(area => area.id === this.selectedAreaIdSignal()) ?? areas[0];
  });

  /** Positions of the selected area. */
  readonly positionsOfSelectedArea = computed<Position[]>(() => {
    const area = this.selectedArea();
    return area ? this.store.positions().filter(position => position.areaId === area.id) : [];
  });

  /**
   * Selects an area to show its positions.
   *
   * @param area - The area to select.
   * @author Oscar Lizandro Vasquez Llave
   */
  selectArea(area: Area) {
    this.selectedAreaIdSignal.set(area.id);
  }

  /**
   * Opens the dialog to create or edit an area.
   *
   * @param area - The area to edit; omit it to create a new one.
   * @author Oscar Lizandro Vasquez Llave
   */
  openAreaDialog(area?: Area) {
    this.dialog.open(AreaFormDialog, { data: { area }, width: '440px', maxWidth: '95vw' });
  }

  /**
   * Opens the dialog to create or edit a position of the selected area.
   *
   * @param position - The position to edit; omit it to create a new one.
   * @author Oscar Lizandro Vasquez Llave
   */
  openPositionDialog(position?: Position) {
    this.dialog.open(PositionFormDialog, {
      data: { position, areaId: this.selectedArea()?.id ?? null },
      width: '440px',
      maxWidth: '95vw'
    });
  }

  /**
   * Activates or deactivates an area.
   *
   * @param area - The area to toggle.
   * @author Oscar Lizandro Vasquez Llave
   */
  toggleArea(area: Area) {
    this.store.toggleAreaStatus(area);
  }

  /**
   * Activates or deactivates a position.
   *
   * @param position - The position to toggle.
   * @author Oscar Lizandro Vasquez Llave
   */
  togglePosition(position: Position) {
    this.store.togglePositionStatus(position);
  }
}
