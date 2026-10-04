import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/guards/role.guard';

/** Lazy loader of the employee list view (US20). */
const employeeList = () => import('./views/employee-list/employee-list').then(m => m.EmployeeList);
/** Lazy loader of the employee form view, used to register and edit employees (US08, US14). */
const employeeForm = () => import('./views/employee-form/employee-form').then(m => m.EmployeeForm);
/** Lazy loader of the employee detail view. */
const employeeDetail = () => import('./views/employee-detail/employee-detail').then(m => m.EmployeeDetail);
/** Lazy loader of the employee documents view (US17). */
const employeeDocuments = () => import('./views/employee-documents/employee-documents').then(m => m.EmployeeDocuments);
/** Lazy loader of the organization chart view (US12, US13). */
const organizationChart = () => import('./views/organization-chart/organization-chart').then(m => m.OrganizationChart);
/** Lazy loader of the organization structure view with areas and positions (US09). */
const organizationStructure = () =>
  import('./views/organization-structure/organization-structure').then(m => m.OrganizationStructure);
/** Lazy loader of the signed-in employee's profile view (US19). */
const myProfile = () => import('./views/my-profile/my-profile').then(m => m.MyProfile);

/**
 * Routes of the Workspace bounded context.
 *
 * @remarks
 * Every view is lazy loaded. All routes except my-profile are protected by the role guard.
 * The data object holds breadcrumb, a list of i18n keys for the breadcrumb trail, and optionally
 * breadcrumbSuffix, an i18n key appended after the trail. The empty path redirects to employees.
 * @author Oscar Lizandro Vasquez Llave
 */
export const workspaceRoutes: Routes = [
  { path: 'employees', loadComponent: employeeList, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.employees'] } },
  { path: 'employees/new', loadComponent: employeeForm, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.employees', 'breadcrumb.new'] } },
  { path: 'employees/:id', loadComponent: employeeDetail, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.employees'] } },
  { path: 'employees/:id/edit', loadComponent: employeeForm, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.employees', 'breadcrumb.edit'] } },
  { path: 'employees/:id/documents', loadComponent: employeeDocuments, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.employees'], breadcrumbSuffix: 'breadcrumb.file' } },
  { path: 'organization-chart', loadComponent: organizationChart, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.organization', 'breadcrumb.organization-chart'] } },
  { path: 'organization-structure', loadComponent: organizationStructure, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.organization', 'breadcrumb.organization-structure'] } },
  { path: 'my-profile', loadComponent: myProfile, data: { breadcrumb: ['breadcrumb.my-profile'] } },
  { path: '', redirectTo: 'employees', pathMatch: 'full' }
];
