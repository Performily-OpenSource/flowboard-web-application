import {Routes} from '@angular/router';

const requestInbox = () => import('./views/request-inbox/request-inbox').then(m => m.RequestInbox);
const requestTypeList = () => import('./views/request-type-list/request-type-list').then(m => m.RequestTypeList);
const requestTypeForm = () => import('./views/request-type-form/request-type-form').then(m => m.RequestTypeForm);
const myRequests = () => import('./views/my-requests/my-requests').then(m => m.MyRequests);
const requestForm = () => import('./views/request-form/request-form').then(m => m.RequestForm);

export const requestRoutes: Routes = [
  { path: 'inbox', loadComponent: requestInbox, data: { breadcrumb: ['breadcrumb.requests'] } },
  { path: 'types', loadComponent: requestTypeList, data: { breadcrumb: ['breadcrumb.requests', 'breadcrumb.request-types'] } },
  { path: 'types/new', loadComponent: requestTypeForm, data: { breadcrumb: ['breadcrumb.requests', 'breadcrumb.request-types', 'breadcrumb.new'] } },
  { path: 'types/:id/edit', loadComponent: requestTypeForm, data: { breadcrumb: ['breadcrumb.requests', 'breadcrumb.request-types', 'breadcrumb.edit'] } },
  { path: 'my-requests', loadComponent: myRequests, data: { breadcrumb: ['breadcrumb.my-requests'] } },
  { path: 'my-requests/new', loadComponent: requestForm, data: { breadcrumb: ['breadcrumb.my-requests', 'breadcrumb.new-female'] } },
  { path: 'my-requests/:id/complete', loadComponent: requestForm, data: { breadcrumb: ['breadcrumb.my-requests', 'breadcrumb.complete'] } },
  { path: '', redirectTo: 'inbox', pathMatch: 'full' }
];
