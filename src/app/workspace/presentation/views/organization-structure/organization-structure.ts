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
  readonly store = inject(WorkspaceStore);
  private dialog = inject(MatDialog);

  readonly columns = ['title', 'referenceSalary', 'active', 'actions'];

  private readonly selectedAreaIdSignal = signal<number | null>(null);

  readonly selectedArea = computed<Area | undefined>(() => {
    const areas = this.store.areas();
    return areas.find(area => area.id === this.selectedAreaIdSignal()) ?? areas[0];
  });

  readonly positionsOfSelectedArea = computed<Position[]>(() => {
    const area = this.selectedArea();
    return area ? this.store.positions().filter(position => position.areaId === area.id) : [];
  });

  selectArea(area: Area) {
    this.selectedAreaIdSignal.set(area.id);
  }

  openAreaDialog(area?: Area) {
    this.dialog.open(AreaFormDialog, { data: { area }, width: '440px', maxWidth: '95vw' });
  }

  openPositionDialog(position?: Position) {
    this.dialog.open(PositionFormDialog, {
      data: { position, areaId: this.selectedArea()?.id ?? null },
      width: '440px',
      maxWidth: '95vw'
    });
  }

  toggleArea(area: Area) {
    this.store.toggleAreaStatus(area);
  }

  togglePosition(position: Position) {
    this.store.togglePositionStatus(position);
  }
}
