import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/guards/role.guard';

/** Lazy loader of the Human Resources inbox view. */
const requestInbox = () => import('./views/request-inbox/request-inbox').then(m => m.RequestInbox);
/** Lazy loader of the request types list view. */
const requestTypeList = () => import('./views/request-type-list/request-type-list').then(m => m.RequestTypeList);
/** Lazy loader of the request type form view (create and edit). */
const requestTypeForm = () => import('./views/request-type-form/request-type-form').then(m => m.RequestTypeForm);
/** Lazy loader of the employee's requests view. */
const myRequests = () => import('./views/my-requests/my-requests').then(m => m.MyRequests);
/** Lazy loader of the request form view (new and complete). */
const requestForm = () => import('./views/request-form/request-form').then(m => m.RequestForm);

/**
 * Routes of the Request bounded context, loaded under '/requests'.
 * The inbox and the request types are only for Human Resources (roleGuard with role 'HR_STAFF').
 *
 * @author Diego Alonso Diaz Villalba
 */
export const requestRoutes: Routes = [
  { path: 'inbox', loadComponent: requestInbox, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.requests'], roles:['HR_STAFF'] } },
  { path: 'types', loadComponent: requestTypeList, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.requests', 'breadcrumb.request-types'], roles:['HR_STAFF'] } },
  { path: 'types/new', loadComponent: requestTypeForm, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.requests', 'breadcrumb.request-types', 'breadcrumb.new'], roles:['HR_STAFF'] } },
  { path: 'types/:id/edit', loadComponent: requestTypeForm, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.requests', 'breadcrumb.request-types', 'breadcrumb.edit'], roles:['HR_STAFF'] } },
  { path: 'my-requests', loadComponent: myRequests, data: { breadcrumb: ['breadcrumb.my-requests'] } },
  { path: 'my-requests/new', loadComponent: requestForm, data: { breadcrumb: ['breadcrumb.my-requests', 'breadcrumb.new-female'] } },
  { path: 'my-requests/:id/complete', loadComponent: requestForm, data: { breadcrumb: ['breadcrumb.my-requests', 'breadcrumb.complete'] } },
  { path: '', redirectTo: 'inbox', pathMatch: 'full' }
];
