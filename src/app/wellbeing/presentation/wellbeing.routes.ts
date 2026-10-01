import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/guards/role.guard';
import {WellbeingDashboard} from './views/wellbeing-dashboard/wellbeing-dashboard';

const dashboard = () => import('./views/wellbeing-dashboard/wellbeing-dashboard').then(m => m.WellbeingDashboard);

export const wellbeingRoutes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: WellbeingDashboard, canActivate:[roleGuard], title: 'Flowboard - Bienestar', data:{roles:['HR_STAFF'], breadcrumb:['breadcrumb.wellbeing']}},
  {path: 'spaces', component: WellbeingDashboard, canActivate:[roleGuard], title: 'Flowboard - Espacios de bienestar', data:{roles:['HR_STAFF'], breadcrumb:['breadcrumb.wellbeing']}},
  {path: 'thresholds', component: WellbeingDashboard, canActivate:[roleGuard], title: 'Flowboard - Umbrales de bienestar', data:{roles:['HR_STAFF'], breadcrumb:['breadcrumb.wellbeing']}}
];
