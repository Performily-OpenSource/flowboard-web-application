import {Routes} from '@angular/router';
import {WellbeingDashboard} from './views/wellbeing-dashboard/wellbeing-dashboard';

export const wellbeingRoutes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: WellbeingDashboard, title: 'Flowboard - Bienestar'},
  {path: 'spaces', component: WellbeingDashboard, title: 'Flowboard - Espacios de bienestar'},
  {path: 'thresholds', component: WellbeingDashboard, title: 'Flowboard - Umbrales de bienestar'}
];
