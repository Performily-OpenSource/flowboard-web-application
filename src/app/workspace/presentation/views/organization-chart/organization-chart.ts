import {Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink, RouterLinkActive} from '@angular/router';
import {map} from 'rxjs';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {TranslatePipe} from '@ngx-translate/core';
import {OrganizationChartNode, WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';

interface ChartColumn {
  head: Employee;
  descendants: { employee: Employee; depth: number }[];
}

@Component({
  selector: 'app-organization-chart',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslatePipe
  ],
  templateUrl: './organization-chart.html',
  styleUrl: './organization-chart.css',
})
export class OrganizationChart {
  readonly store = inject(WorkspaceStore);

  readonly selectedAreaId = signal<number | null>(null);

  readonly highlightedId = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map(params => Number(params.get('highlight')) || null)),
    { initialValue: null });

  readonly chart = computed(() => this.store.buildOrganizationChart(this.selectedAreaId()));

  readonly trees = computed(() => this.chart().roots.map(root => ({
    root: root.employee,
    columns: root.subordinates.map(child => this.toColumn(child))
  })));

  readonly isEmpty = computed(() =>
    this.chart().roots.length === 0 && this.chart().pendingReassignment.length === 0);

  areaName(): string {
    const areaId = this.selectedAreaId();
    return areaId ? this.store.getAreaById(areaId)()?.name ?? '' : '';
  }

  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  exportChart() {
    window.print();
  }

  private toColumn(node: OrganizationChartNode): ChartColumn {
    const descendants: { employee: Employee; depth: number }[] = [];
    const walk = (children: OrganizationChartNode[], depth: number) => children.forEach(child => {
      descendants.push({ employee: child.employee, depth });
      walk(child.subordinates, depth + 1);
    });
    walk(node.subordinates, 0);
    return { head: node.employee, descendants };
  }
}
