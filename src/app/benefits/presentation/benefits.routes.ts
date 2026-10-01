import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/guards/role.guard';

const benefitCatalog = () => import('./views/benefit-catalog/benefit-catalog').then(m => m.BenefitCatalog);
const benefitAssignments = () =>
  import('./views/benefit-assignments/benefit-assignments').then(m => m.BenefitAssignments);
const benefitDeliveries = () =>
  import('./views/benefit-deliveries/benefit-deliveries').then(m => m.BenefitDeliveries);
const vacationBalances = () => import('./views/vacation-balances/vacation-balances').then(m => m.VacationBalances);

export const benefitsRoutes: Routes = [
  { path: 'catalog', loadComponent: benefitCatalog, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.benefits'], roles:['HR_STAFF'] } },
  { path: 'assignments', loadComponent: benefitAssignments, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.benefits', 'breadcrumb.benefit-assignments'], roles:['HR_STAFF'] } },
  { path: 'deliveries', loadComponent: benefitDeliveries, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.benefits', 'breadcrumb.benefit-deliveries'], roles:['HR_STAFF'] } },
  { path: 'balances', loadComponent: vacationBalances, canActivate:[roleGuard], data: { breadcrumb: ['breadcrumb.benefits', 'breadcrumb.vacation-balances'], roles:['HR_STAFF'] } },
  { path: '', redirectTo: 'catalog', pathMatch: 'full' }
];

