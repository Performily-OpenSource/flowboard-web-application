import {Component, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {Toolbar} from '../toolbar/toolbar';
import {SessionStore} from '../../../application/session.store';

/** Option of the sidebar menu. */
interface NavigationOption {
  /** Route opened by the option. */
  link: string;
  /** i18n key of the label. */
  label: string;
  /** Material Symbols icon name. */
  icon: string;
  /** Routes that keep the option highlighted. */
  activeWhen: string[];
  /** Roles that see the option; when missing, every role sees it. */
  roles?: Array<'HR_STAFF' | 'EMPLOYEE'>;
}

/**
 * Shell of the application: sidebar menu, toolbar and router outlet.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatIcon,
    TranslatePipe,
    Toolbar
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private router = inject(Router);
  private readonly session = inject(SessionStore);

  /** Options of the sidebar menu. Each bounded context adds its own options here. */
  readonly options = signal<NavigationOption[]>([
    { link: '/home', label: 'option.dashboard', icon: 'grid_view', activeWhen: ['/home'] },
    { link: '/workspace/employees', label: 'option.employees', icon: 'group', activeWhen: ['/workspace/employees'], roles: ['HR_STAFF'] },

    {
      link: '/workspace/organization-chart', label: 'option.organization', icon: 'account_tree',
      activeWhen: ['/workspace/organization-chart', '/workspace/organization-structure'], roles: ['HR_STAFF']
    },
    { link: '/workspace/my-profile', label: 'option.my-profile', icon: 'badge', activeWhen: ['/workspace/my-profile'] },
    { link: '/attendance/records', label: 'option.attendance', icon: 'schedule', activeWhen: ['/attendance/records', '/attendance/summary', '/attendance/hours'], roles: ['HR_STAFF'] },
    { link: '/attendance/my-attendance', label: 'option.my-attendance', icon: 'schedule', activeWhen: ['/attendance/my-attendance'] },
    { link: '/requests/inbox', label: 'option.requests', icon: 'assignment_turned_in', activeWhen: ['/requests/inbox', '/requests/types'], roles: ['HR_STAFF'] },
    { link: '/requests/my-requests', label: 'option.my-requests', icon: 'description', activeWhen: ['/requests/my-requests'] },
    { link: '/benefits', label: 'option.benefits', icon: 'calendar_month', activeWhen: ['/benefits/catalog', '/benefits/assignments', '/benefits/deliveries', '/benefits/balances'], roles: ['HR_STAFF'] },
    { link: '/benefits/my-benefits', label: 'option.my-benefits', icon: 'redeem', activeWhen: ['/benefits/my-benefits'] },
    { link: '/payroll/payslips', label: 'option.payroll', icon: 'receipt_long', activeWhen: ['/payroll/payslips'], roles: ['HR_STAFF'] },
    { link: '/payroll/my-payslips', label: 'option.my-payslips', icon: 'receipt_long', activeWhen: ['/payroll/my-payslips'] },
    { link: '/wellbeing/dashboard', label: 'option.wellbeing', icon: 'health_and_safety', activeWhen: ['/wellbeing'], roles: ['HR_STAFF'] }
  ]);

  /** Whether the screen is narrow (959px or less); the sidebar becomes a drawer. */
  readonly isHandset = toSignal(
    inject(BreakpointObserver).observe('(max-width: 959px)').pipe(map(result => result.matches)),
    { initialValue: false });

  /** URL of the current route, updated after each navigation. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url });

  /**
   * Filters the menu options by the role of the signed-in user.
   *
   * @returns The options the user can see.
   * @author Oscar Lizandro Vasquez Llave
   */
  visibleOptions(): NavigationOption[] {
    const role = this.session.role();
    return this.options().filter(option => !option.roles || (!!role && option.roles.includes(role)));
  }

  /**
   * Checks whether an option matches the current route.
   *
   * @param option - Menu option.
   * @returns True when the current URL starts with one of its routes.
   * @author Oscar Lizandro Vasquez Llave
   */
  isActive(option: NavigationOption): boolean {
    const url = this.currentUrl();
    return option.activeWhen.some(path => url.startsWith(path));
  }

  /**
   * Handles the global search of the toolbar: opens the employee list filtered by the text.
   *
   * @param text - Text written in the toolbar search box.
   * @author Oscar Lizandro Vasquez Llave
   */
  searchEmployees(text: string) {
    this.router.navigate(['/workspace/employees'], { queryParams: { search: text } });
  }
}