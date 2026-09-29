import {Routes} from '@angular/router';

const employeeList = () => import('./views/employee-list/employee-list').then(m => m.EmployeeList);
const employeeForm = () => import('./views/employee-form/employee-form').then(m => m.EmployeeForm);
const employeeDetail = () => import('./views/employee-detail/employee-detail').then(m => m.EmployeeDetail);
const employeeDocuments = () => import('./views/employee-documents/employee-documents').then(m => m.EmployeeDocuments);
const organizationChart = () => import('./views/organization-chart/organization-chart').then(m => m.OrganizationChart);
const organizationStructure = () =>
  import('./views/organization-structure/organization-structure').then(m => m.OrganizationStructure);

export const workspaceRoutes: Routes = [
  { path: 'employees', loadComponent: employeeList, data: { breadcrumb: ['breadcrumb.employees'] } },
  { path: 'employees/new', loadComponent: employeeForm, data: { breadcrumb: ['breadcrumb.employees', 'breadcrumb.new'] } },
  { path: 'employees/:id', loadComponent: employeeDetail, data: { breadcrumb: ['breadcrumb.employees'] } },
  { path: 'employees/:id/edit', loadComponent: employeeForm, data: { breadcrumb: ['breadcrumb.employees', 'breadcrumb.edit'] } },
  { path: 'employees/:id/documents', loadComponent: employeeDocuments, data: { breadcrumb: ['breadcrumb.employees'], breadcrumbSuffix: 'breadcrumb.file' } },
  { path: 'organization-chart', loadComponent: organizationChart, data: { breadcrumb: ['breadcrumb.organization', 'breadcrumb.organization-chart'] } },
  { path: 'organization-structure', loadComponent: organizationStructure, data: { breadcrumb: ['breadcrumb.organization', 'breadcrumb.organization-structure'] } },
  { path: '', redirectTo: 'employees', pathMatch: 'full' }
];
