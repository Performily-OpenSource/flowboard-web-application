import {Component, computed, inject, input, output} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {filter, map} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {LayoutStore} from '../../../application/layout.store';
import {SessionStore} from '../../../application/session.store';
import {IamStore} from '../../../../iam/application/iam.store';

/**
 * Top bar of the shell: breadcrumb, language switcher and signed-in user.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-toolbar',
  imports: [
    MatIcon,
    MatIconButton,
    MatDivider,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
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
  private readonly iam = inject(IamStore);

  /** Shows the button that opens the sidebar on small screens. */
  readonly showMenuButton = input(false);
  /** Emits when the menu button is pressed. */
  readonly menuToggle = output<void>();

  /** URL of the current route, updated after each navigation. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url });

  /** Data of the deepest active route, where the breadcrumb keys are declared. */
  private readonly deepestRouteData = computed(() => {
    this.currentUrl();
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    return route.data;
  });

  /** i18n keys of the breadcrumb of the current route. */
  readonly breadcrumb = computed<string[]>(() =>
    (this.deepestRouteData()['breadcrumb'] as string[] | undefined) ?? ['breadcrumb.dashboard']);

  /** i18n key shown after the dynamic detail, e.g. "Employees › Ana Quispe Torres › File". */
  readonly breadcrumbSuffix = computed(() => this.deepestRouteData()['breadcrumbSuffix'] as string | undefined);

  /**
   * Clears the breadcrumb detail when a navigation starts.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => this.layoutStore.setBreadcrumbDetail(null));
  }

  /**
   * Initials of the signed-in user for the avatar.
   *
   * @returns Up to two uppercase letters.
   * @author Oscar Lizandro Vasquez Llave
   */
  initials(): string { return this.session.displayName().split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase(); }

  /**
   * i18n key of the role of the signed-in user.
   *
   * @returns The key of the HR or employee role.
   * @author Oscar Lizandro Vasquez Llave
   */
  roleLabel(): string { return this.session.role() === 'HR_STAFF' ? 'toolbar.hr-role' : 'toolbar.employee-role'; }

  /**
   * Ends the session and goes to the sign-in page.
   *
   * @author Oscar Lizandro Vasquez Llave
   */

  logout(): void { this.iam.signOut(); this.router.navigate(['/login']).then(); }

  /**
   * Emits the global search text and clears the box.
   *
   * @param searchInput - Search input element.
   * @author Oscar Lizandro Vasquez Llave
   */
  onSearch(searchInput: HTMLInputElement) {
    const text = searchInput.value.trim();
    if (!text) return;
    this.searchSubmit.emit(text);
    searchInput.value = '';
    searchInput.blur();
  }
}
