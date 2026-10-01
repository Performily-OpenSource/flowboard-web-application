import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {SessionStore} from '../../shared/application/session.store';
import {RoleType} from '../domain/model/role.entity';

export const roleGuard: CanActivateFn = route => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.isAuthenticated()) return router.createUrlTree(['/login']);
  const roles = route.data['roles'] as RoleType[] | undefined;
  if (!roles?.length || roles.includes(session.role()!)) return true;
  return router.createUrlTree(['/home']);
};
