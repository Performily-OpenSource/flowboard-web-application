import {InjectionToken, Type} from '@angular/core';

/**
 * Dashboards of the home view: 'hr' is the Human Resources dashboard (WA-02)
 * and 'employee' is the collaborator home (WA-10).
 */
export type DashboardKind = 'hr' | 'employee';

/**
 * Places of a dashboard where a widget is shown.
 * - kpi: indicator of the top row (only in the HR dashboard).
 * - column-1, column-2, column-3: cards of each column, from left to right.
 */
export type DashboardSlot = 'kpi' | 'column-1' | 'column-2' | 'column-3';

/**
 * Widget that a bounded context registers in a dashboard.
 *
 * @remarks Widgets of the 'employee' dashboard must declare employeeId = input.required<number>();
 * the home view passes the id of the signed-in employee. Widgets of the 'hr' dashboard take no inputs.
 * @author Oscar Lizandro Vasquez Llave
 */
export interface DashboardWidget {
  /** Dashboard where the widget is shown. */
  dashboard: DashboardKind;
  /** Place of the dashboard where the widget is shown. */
  slot: DashboardSlot;
  /** Position among the widgets of the same slot. */
  order: number;
  /** Component to show. */
  component: Type<unknown>;
}

/**
 * Extension point of the home dashboards. Shared does not import any bounded context:
 * each context registers its widgets in app.config.ts with multi: true.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export const DASHBOARD_WIDGETS = new InjectionToken<DashboardWidget[]>('DASHBOARD_WIDGETS');
