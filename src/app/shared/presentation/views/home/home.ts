import {Component, computed, inject} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {SessionStore} from '../../../application/session.store';
import {CurrentEmployeeStore} from '../../../application/current-employee.store';
import {
  DASHBOARD_WIDGETS,
  DashboardKind,
  DashboardSlot,
  DashboardWidget
} from '../../components/dashboard-widget/dashboard-widget';

/**
 * Home view: Human Resources dashboard (WA-02) or collaborator home (WA-10), depending on the role.
 *
 * @remarks The cards come from the bounded contexts through DASHBOARD_WIDGETS; this view only
 * places them and passes the employee id to the collaborator widgets.
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-home',
  imports: [
    NgComponentOutlet,
    TranslatePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly session = inject(SessionStore);
  private readonly currentEmployee = inject(CurrentEmployeeStore);

  /** Widgets registered by the bounded contexts, sorted by their order. */
  private readonly widgets = [...(inject(DASHBOARD_WIDGETS, { optional: true }) ?? [])]
    .sort((a, b) => a.order - b.order);

  /** Dashboard of the signed-in user: collaborators see their own home, HR staff the HR dashboard. */
  readonly dashboard = computed<DashboardKind>(() => this.session.role() === 'EMPLOYEE' ? 'employee' : 'hr');

  /** Id of the signed-in employee, passed to the collaborator widgets. */
  readonly employeeId = computed(() => this.session.employeeId() ?? this.currentEmployee.employeeId());

  /** First name used in the greeting. */
  readonly firstName = computed(() => this.session.displayName().split(' ')[0] ?? '');

  /** Column slots, from left to right. */
  readonly columns: DashboardSlot[] = ['column-1', 'column-2', 'column-3'];

  /** Today's date as dd/MM/yyyy. */
  readonly today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  /** i18n key of the greeting of the HR dashboard, according to the time of day. */
  readonly greetingKey = (() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'home.good-morning' : hour < 19 ? 'home.good-afternoon' : 'home.good-evening';
  })();

  /**
   * Widgets of the current dashboard for one slot.
   *
   * @param slot - Place of the dashboard.
   * @returns The widgets registered for that slot.
   * @author Oscar Lizandro Vasquez Llave
   */
  widgetsFor(slot: DashboardSlot): DashboardWidget[] {
    return this.widgets.filter(widget => widget.dashboard === this.dashboard() && widget.slot === slot);
  }

  /**
   * Inputs passed to a widget: the employee id for the collaborator dashboard, none for HR.
   *
   * @returns The inputs object for NgComponentOutlet.
   * @author Oscar Lizandro Vasquez Llave
   */
  widgetInputs(): Record<string, unknown> {
    return this.dashboard() === 'employee' ? { employeeId: this.employeeId() } : {};
  }
}
