import {Routes} from '@angular/router';
import {Home} from './shared/presentation/views/home/home';

const about = () =>
  import('./shared/presentation/views/about/about').then(m => m.About);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

const workspaceRoutes = () =>
  import('./workspace/presentation/workspace.routes').then(m => m.workspaceRoutes);

const benefitsRoutes = () =>
  import('./benefits/presentation/benefits.routes').then(m => m.benefitsRoutes);
const payrollRoutes = () =>
  import('./payroll/presentation/payroll.routes').then(m => m.payrollRoutes);
const wellbeingRoutes = () =>
  import('./wellbeing/presentation/wellbeing.routes').then(m => m.wellbeingRoutes);

const baseTitle = 'Flowboard';

export const routes: Routes = [
  { path: 'home', component: Home, title: `${baseTitle} - Home`, data: { breadcrumb: ['breadcrumb.dashboard'] } },
  { path: 'about', loadComponent: about, title: `${baseTitle} - About`, data: { breadcrumb: ['breadcrumb.about'] } },
  { path: 'workspace', loadChildren: workspaceRoutes, title: `${baseTitle} - Workspace` },
  { path: 'benefits', loadChildren: benefitsRoutes, title: `${baseTitle} - Benefits` },
  { path: 'payroll', loadChildren: payrollRoutes, title: `${baseTitle} - Payroll` },
  { path: 'wellbeing', loadChildren: wellbeingRoutes, title: `${baseTitle} - Bienestar` },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found`, data: { breadcrumb: ['breadcrumb.page-not-found'] } }
];