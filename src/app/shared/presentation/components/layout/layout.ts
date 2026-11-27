import {Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {Toolbar} from '../toolbar/toolbar';
import {SessionStore} from '../../../application/session.store';

/** Section of the sidebar that groups related options. */
type NavigationSection = 'general' | 'management' | 'personal';

/** Group of options shown under one section title. */
interface NavigationGroup {
  /** Section the options belong to. */
  section: NavigationSection;
  /** i18n key of the section title. */
  title: string;
  /** Options of the section the user can see. */
  options: NavigationOption[];
}

/** Option of the sidebar menu. */
interface NavigationOption {
  /** Section that groups the option. */
  section: NavigationSection;
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
    MatTooltip,
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
    { section: 'general', link: '/home', label: 'option.dashboard', icon: 'grid_view', activeWhen: ['/home'] },
    { section: 'management', link: '/workspace/employees', label: 'option.employees', icon: 'group', activeWhen: ['/workspace/employees'], roles: ['HR_STAFF'] },

    {
      section: 'management', link: '/workspace/organization-chart', label: 'option.organization', icon: 'account_tree',
      activeWhen: ['/workspace/organization-chart', '/workspace/organization-structure'], roles: ['HR_STAFF']
    },
    { section: 'personal', link: '/workspace/my-profile', label: 'option.my-profile', icon: 'badge', activeWhen: ['/workspace/my-profile'] },
    { section: 'management', link: '/attendance/records', label: 'option.attendance', icon: 'schedule', activeWhen: ['/attendance/records', '/attendance/summary', '/attendance/hours'], roles: ['HR_STAFF'] },
    { section: 'personal', link: '/attendance/my-attendance', label: 'option.my-attendance', icon: 'schedule', activeWhen: ['/attendance/my-attendance'] },
    { section: 'management', link: '/requests/inbox', label: 'option.requests', icon: 'assignment_turned_in', activeWhen: ['/requests/inbox', '/requests/types'], roles: ['HR_STAFF'] },
    { section: 'personal', link: '/requests/my-requests', label: 'option.my-requests', icon: 'description', activeWhen: ['/requests/my-requests'] },
    { section: 'management', link: '/benefits', label: 'option.benefits', icon: 'calendar_month', activeWhen: ['/benefits/catalog', '/benefits/assignments', '/benefits/deliveries', '/benefits/balances'], roles: ['HR_STAFF'] },
    { section: 'personal', link: '/benefits/my-benefits', label: 'option.my-benefits', icon: 'redeem', activeWhen: ['/benefits/my-benefits'] },
    { section: 'management', link: '/payroll/payslips', label: 'option.payroll', icon: 'receipt_long', activeWhen: ['/payroll/payslips'], roles: ['HR_STAFF'] },
    { section: 'personal', link: '/payroll/my-payslips', label: 'option.my-payslips', icon: 'receipt_long', activeWhen: ['/payroll/my-payslips'] },
    { section: 'management', link: '/wellbeing/dashboard', label: 'option.wellbeing', icon: 'health_and_safety', activeWhen: ['/wellbeing'], roles: ['HR_STAFF'] }
  ]);

  /** Titles of the sidebar sections, in display order. */
  private readonly sections: Array<{ section: NavigationSection; title: string }> = [
    { section: 'general', title: 'option.section.general' },
    { section: 'management', title: 'option.section.management' },
    { section: 'personal', title: 'option.section.personal' }
  ];

  /** Whether the screen is narrow (959px or less); the sidebar becomes a drawer. */
  readonly isHandset = toSignal(
    inject(BreakpointObserver).observe('(max-width: 959px)').pipe(map(result => result.matches)),
    { initialValue: false });

  /** localStorage key that remembers whether the sidebar is collapsed. */
  private static readonly COLLAPSED_KEY = 'flowboard.sidebar-collapsed';

  /** Whether the user collapsed the sidebar to icons only. */
  private readonly collapsed = signal(Layout.readCollapsed());

  /** Whether the sidebar shows icons only; on narrow screens it is always a full drawer. */
  readonly isCollapsed = computed(() => this.collapsed() && !this.isHandset());

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
   * Groups the visible options by section and drops the sections left empty.
   *
   * @returns The sections the user can see, each with its options.
   * @author Oscar Lizandro Vasquez Llave
   */
  visibleGroups(): NavigationGroup[] {
    const visible = this.visibleOptions();
    return this.sections
      .map(({ section, title }) => ({ section, title, options: visible.filter(option => option.section === section) }))
      .filter(group => group.options.length > 0);
  }

  /**
   * Collapses or expands the sidebar and remembers the choice.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  toggleCollapsed(): void {
    const value = !this.collapsed();
    this.collapsed.set(value);
    try {
      localStorage.setItem(Layout.COLLAPSED_KEY, String(value));
    } catch {
      // Storage not available: the choice only lasts for this visit.
    }
  }

  /**
   * Reads the saved collapsed state.
   *
   * @returns True when the user left the sidebar collapsed.
   * @author Oscar Lizandro Vasquez Llave
   */
  private static readCollapsed(): boolean {
    try {
      return localStorage.getItem(Layout.COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
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
}
