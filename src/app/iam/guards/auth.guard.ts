import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {SessionStore} from '../../shared/application/session.store';

/**
 * Protects authenticated routes from unauthenticated access.
 *
 * @remarks Checks the current session and redirects unauthenticated users to the login flow while preserving the requested URL.
 * @author Dario Avila de la cruz
 */
export const authGuard: CanActivateFn = (_, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.isAuthenticated()) return router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
  if (session.mustChangePassword() && state.url !== '/change-password') return router.createUrlTree(['/change-password']);
  return true;
};

/**
 * Protects the first-login password-change route.
 *
 * @remarks Allows the route only when the current authenticated account is required to change its password.
 * @author Dario Avila de la cruz
 */
export const passwordChangeGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.isAuthenticated()) return router.createUrlTree(['/login']);
  return session.mustChangePassword() ? true : router.createUrlTree(['/home']);
};
