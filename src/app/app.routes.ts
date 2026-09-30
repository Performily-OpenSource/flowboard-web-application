import {Routes} from '@angular/router';
import {Home} from './shared/presentation/views/home/home';

const about = () =>
  import('./shared/presentation/views/about/about').then(m => m.About);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

const workspaceRoutes = () =>
  import('./workspace/presentation/workspace.routes').then(m => m.workspaceRoutes);

const attendanceRoutes = () =>
  import('./attendance/presentation/attendance.routes').then(m => m.attendanceRoutes);

const baseTitle = 'Flowboard';

export const routes: Routes = [
  { path: 'home', component: Home, title: `${baseTitle} - Home`, data: { breadcrumb: ['breadcrumb.dashboard'] } },
  { path: 'about', loadComponent: about, title: `${baseTitle} - About`, data: { breadcrumb: ['breadcrumb.about'] } },
  { path: 'workspace', loadChildren: workspaceRoutes, title: `${baseTitle} - Workspace` },
  { path: 'attendance', loadChildren: attendanceRoutes, title: `${baseTitle} - Attendance` },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found`, data: { breadcrumb: ['breadcrumb.page-not-found'] } },
];