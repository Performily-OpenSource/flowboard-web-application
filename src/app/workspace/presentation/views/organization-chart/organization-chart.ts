import {Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink, RouterLinkActive} from '@angular/router';
import {map} from 'rxjs';
import {NgTemplateOutlet} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {TranslatePipe} from '@ngx-translate/core';
import {OrganizationChartNode, WorkspaceStore} from '../../../application/workspace.store';
import {Employee} from '../../../domain/model/employee.entity';

/** A column of the chart: a direct report of a root and the tree of employees below them. */
interface ChartColumn {
  /** The direct report that heads the column. */
  head: Employee;
  /** Direct subordinates of the head, drawn as an indented tree below it. */
  children: OrganizationChartNode[];
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
    NgTemplateOutlet,
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
    columns: this.sorted(root.subordinates).map(child => this.toColumn(child))
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
   * Orders subordinates so managers come before the people without a team, then by name.
   *
   * @param nodes - Subordinates of one employee.
   * @returns A sorted copy.
   * @author Oscar Lizandro Vasquez Llave
   */
  sorted(nodes: OrganizationChartNode[]): OrganizationChartNode[] {
    return [...nodes].sort((a, b) =>
      (b.subordinates.length > 0 ? 1 : 0) - (a.subordinates.length > 0 ? 1 : 0)
      || a.employee.fullName.localeCompare(b.employee.fullName));
  }

  /**
   * Builds a first-level column: the head and its direct subordinates.
   *
   * @param node - First-level subordinate of a root.
   * @returns The column to draw.
   * @author Oscar Lizandro Vasquez Llave
   */
  private toColumn(node: OrganizationChartNode): ChartColumn {
    return { head: node.employee, children: this.sorted(node.subordinates) };
  }

}
