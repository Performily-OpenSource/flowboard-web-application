import {Component, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {Toolbar} from '../toolbar/toolbar';

interface NavigationOption {
  link: string;
  label: string;
  icon: string;
  activeWhen: string[];
}

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

  readonly options = signal<NavigationOption[]>([
    { link: '/home', label: 'option.dashboard', icon: 'grid_view', activeWhen: ['/home'] },
    { link: '/workspace/employees', label: 'option.employees', icon: 'group', activeWhen: ['/workspace/employees'] },
    { link: '/payroll/payslips', label: 'option.payroll', icon: 'receipt_long', activeWhen: ['/payroll/payslips'] },
    { link: '/payroll/my-payslips', label: 'option.my-payslips', icon: 'receipt_long', activeWhen: ['/payroll/my-payslips'] },
    {
      link: '/workspace/organization-chart', label: 'option.organization', icon: 'account_tree',
      activeWhen: ['/workspace/organization-chart', '/workspace/organization-structure']
    }
  ]);

  readonly isHandset = toSignal(
    inject(BreakpointObserver).observe('(max-width: 959px)').pipe(map(result => result.matches)),
    { initialValue: false });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url });

  isActive(option: NavigationOption): boolean {
    const url = this.currentUrl();
    return option.activeWhen.some(path => url.startsWith(path));
  }

  searchEmployees(text: string) {
    this.router.navigate(['/workspace/employees'], { queryParams: { search: text } });
  }
}