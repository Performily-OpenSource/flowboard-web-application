import {Routes} from '@angular/router';

const dashboard = () => import('./views/wellbeing-dashboard/wellbeing-dashboard').then(m => m.WellbeingDashboard);

export const wellbeingRoutes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', loadComponent: dashboard, data: {breadcrumb: ['breadcrumb.wellbeing-dashboard']}},
  {path: 'spaces', loadComponent: dashboard, data: {breadcrumb: ['breadcrumb.wellbeing-spaces']}},
  {path: 'thresholds', loadComponent: dashboard, data: {breadcrumb: ['breadcrumb.wellbeing-thresholds']}}
];
