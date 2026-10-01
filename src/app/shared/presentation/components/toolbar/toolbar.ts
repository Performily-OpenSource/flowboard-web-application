import {Component, computed, inject, input, output} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {filter, map} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {LayoutStore} from '../../../application/layout.store';
import {SessionStore} from '../../../application/session.store';
import {CurrentEmployeeStore} from '../../../application/current-employee.store';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuTrigger,
    MatTooltip,
    TranslatePipe,
    LanguageSwitcher
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly layoutStore = inject(LayoutStore);
  readonly session = inject(SessionStore);
  private readonly currentEmployee = inject(CurrentEmployeeStore);

  readonly showMenuButton = input(false);
  readonly menuToggle = output<void>();
  readonly searchSubmit = output<string>();

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

  initials(): string { return this.session.displayName().split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase(); }

  roleLabel(): string { return this.session.role() === 'HR_STAFF' ? 'toolbar.hr-role' : 'toolbar.employee-role'; }

  logout(): void { this.session.clear(); this.currentEmployee.setEmployeeId(1); this.router.navigate(['/login']).then(); }

  onSearch(searchInput: HTMLInputElement) {
    const text = searchInput.value.trim();
    if (!text) return;
    this.searchSubmit.emit(text);
    searchInput.value = '';
    searchInput.blur();
  }
}