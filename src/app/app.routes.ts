import {Routes} from '@angular/router';
import {Home} from './shared/presentation/views/home/home';
import {Layout} from './shared/presentation/components/layout/layout';
import {authGuard} from './iam/guards/auth.guard';
import {roleGuard} from './iam/guards/role.guard';
import {iamPublicRoutes} from './iam/presentation/iam.routes';
import {RoleType} from './iam/domain/model/role.entity';

const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);
const workspaceRoutes = () => import('./workspace/presentation/workspace.routes').then(m => m.workspaceRoutes);
const benefitsRoutes = () => import('./benefits/presentation/benefits.routes').then(m => m.benefitsRoutes);
const payrollRoutes = () => import('./payroll/presentation/payroll.routes').then(m => m.payrollRoutes);
const wellbeingRoutes = () => import('./wellbeing/presentation/wellbeing.routes').then(m => m.wellbeingRoutes);
const attendanceRoutes = () => import('./attendance/presentation/attendance.routes').then(m => m.attendanceRoutes);
const requestRoutes = () => import('./request/presentation/request.routes').then(m => m.requestRoutes);
const accounts = () => import('./iam/presentation/views/account-list/account-list').then(m => m.AccountList);

const hrOnly: RoleType[] = ['HR_STAFF'];

export const routes: Routes = [
  ...iamPublicRoutes,
  {
    path: '', component: Layout, canActivate: [authGuard],
    children: [
      { path: 'home', component: Home, data: { breadcrumb: ['breadcrumb.dashboard'] } },
      { path: 'about', loadComponent: about, data: { breadcrumb: ['breadcrumb.about'] } },
      { path: 'workspace/accounts', loadComponent: accounts, canActivate: [roleGuard], data: { roles: hrOnly, breadcrumb: ['breadcrumb.employees', 'breadcrumb.accounts'] } },
      { path: 'workspace', loadChildren: workspaceRoutes },
      { path: 'benefits', loadChildren: benefitsRoutes },
      { path: 'payroll', loadChildren: payrollRoutes },
      { path: 'wellbeing', loadChildren: wellbeingRoutes },
      { path: 'attendance', loadChildren: attendanceRoutes },
      { path: 'requests', loadChildren: requestRoutes },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: '**', loadComponent: pageNotFound, data: { breadcrumb: ['breadcrumb.page-not-found'] } }
    ]
  }
];
