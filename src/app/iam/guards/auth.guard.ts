import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {SessionStore} from '../../shared/application/session.store';

export const authGuard: CanActivateFn = (_, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.isAuthenticated()) return router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
  if (session.mustChangePassword() && state.url !== '/change-password') return router.createUrlTree(['/change-password']);
  return true;
};

export const passwordChangeGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.isAuthenticated()) return router.createUrlTree(['/login']);
  return session.mustChangePassword() ? true : router.createUrlTree(['/home']);
};
