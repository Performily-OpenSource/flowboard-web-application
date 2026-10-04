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

/** A column of the chart: a direct report of a root and every employee below them. */
interface ChartColumn {
  /** The direct report that heads the column. */
  head: Employee;
  /** Employees below the head in depth-first order, with their depth relative to the head. */
  descendants: { employee: Employee; depth: number }[];
}

/**
 * Organization chart view (WA-43).
 *
 * Shows the reporting hierarchy as root employees with one column per direct report (US12),
 * optionally filtered by area (US13). It highlights the employee given in the ?highlight=
 * query param, lists employees pending a manager reassignment and can be printed.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
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
  /** Workspace store that builds the organization chart. */
  readonly store = inject(WorkspaceStore);

  /** Selected area filter; null shows the whole organization. */
  readonly selectedAreaId = signal<number | null>(null);

  /** Id of the employee to highlight, taken from the ?highlight= query param. */
  readonly highlightedId = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map(params => Number(params.get('highlight')) || null)),
    { initialValue: null });

  /** Organization chart of the selected area. */
  readonly chart = computed(() => this.store.buildOrganizationChart(this.selectedAreaId()));

  /** Each root employee with its direct reports arranged as columns. */
  readonly trees = computed(() => this.chart().roots.map(root => ({
    root: root.employee,
    columns: root.subordinates.map(child => this.toColumn(child))
  })));

  /** Whether the chart has no roots and no employees pending reassignment. */
  readonly isEmpty = computed(() =>
    this.chart().roots.length === 0 && this.chart().pendingReassignment.length === 0);

  /**
   * Gets the name of the selected area.
   *
   * @returns The area name, or an empty string if no area is selected
   * @author Oscar Lizandro Vasquez Llave
   */
  areaName(): string {
    const areaId = this.selectedAreaId();
    return areaId ? this.store.getAreaById(areaId)()?.name ?? '' : '';
  }

  /**
   * Builds the initials of an employee for the avatar.
   *
   * @param employee - The employee.
   * @returns The uppercase initials of the first and last name
   * @author Oscar Lizandro Vasquez Llave
   */
  initials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  /** Opens the browser print dialog to export the chart. */
  exportChart() {
    window.print();
  }

  /**
   * Flattens a chart node into a column.
   *
   * @param node - The node of a direct report of a root.
   * @returns The column headed by the node employee with its descendants
   * @author Oscar Lizandro Vasquez Llave
   */
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
