import {Routes} from '@angular/router';
import {authGuard, passwordChangeGuard} from '../guards/auth.guard';

const login = () => import('./views/login/login').then(m => m.Login);
const changePassword = () => import('./views/change-password/change-password').then(m => m.ChangePassword);
const forgotPassword = () => import('./views/forgot-password/forgot-password').then(m => m.ForgotPassword);
const disabled = () => import('./views/account-disabled/account-disabled').then(m => m.AccountDisabled);

/**
 * Defines the public IAM routes.
 *
 * @remarks Registers the login, forgot-password, password-change and disabled-account views used by the IAM authentication flow.
 * @author Dario Avila de la cruz
 */
export const iamPublicRoutes: Routes = [
  {path:'login', loadComponent: login},
  {path:'forgot-password', loadComponent: forgotPassword},
  {path:'change-password', loadComponent: changePassword, canActivate:[passwordChangeGuard]},
  {path:'account-disabled', loadComponent: disabled}
];
