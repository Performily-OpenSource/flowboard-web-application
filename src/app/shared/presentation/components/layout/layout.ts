import {Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {LayoutStore} from '../../../application/layout.store';

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
    MatIconButton,
    TranslatePipe,
    LanguageSwitcher
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly layoutStore = inject(LayoutStore);

  readonly options = signal<NavigationOption[]>([
    { link: '/home', label: 'option.dashboard', icon: 'grid_view', activeWhen: ['/home'] },
    { link: '/workspace/employees', label: 'option.employees', icon: 'group', activeWhen: ['/workspace/employees'] },
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

  private readonly deepestRouteData = computed(() => {
    this.currentUrl();
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    return route.data;
  });

  readonly breadcrumb = computed<string[]>(() =>
    (this.deepestRouteData()['breadcrumb'] as string[] | undefined) ?? ['breadcrumb.dashboard']);

  readonly breadcrumbSuffix = computed(() => this.deepestRouteData()['breadcrumbSuffix'] as string | undefined);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => this.layoutStore.setBreadcrumbDetail(null));
  }

  isActive(option: NavigationOption): boolean {
    const url = this.currentUrl();
    return option.activeWhen.some(path => url.startsWith(path));
  }
}