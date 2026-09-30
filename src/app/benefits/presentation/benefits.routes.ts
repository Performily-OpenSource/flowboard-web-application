import {Routes} from '@angular/router';

const benefitCatalog = () => import('./views/benefit-catalog/benefit-catalog').then(m => m.BenefitCatalog);
const benefitAssignments = () =>
  import('./views/benefit-assignments/benefit-assignments').then(m => m.BenefitAssignments);
const benefitDeliveries = () =>
  import('./views/benefit-deliveries/benefit-deliveries').then(m => m.BenefitDeliveries);
const vacationBalances = () => import('./views/vacation-balances/vacation-balances').then(m => m.VacationBalances);

export const benefitsRoutes: Routes = [
  { path: 'catalog', loadComponent: benefitCatalog, data: { breadcrumb: ['breadcrumb.benefits'] } },
  { path: 'assignments', loadComponent: benefitAssignments, data: { breadcrumb: ['breadcrumb.benefits', 'breadcrumb.benefit-assignments'] } },
  { path: 'deliveries', loadComponent: benefitDeliveries, data: { breadcrumb: ['breadcrumb.benefits', 'breadcrumb.benefit-deliveries'] } },
  { path: 'balances', loadComponent: vacationBalances, data: { breadcrumb: ['breadcrumb.benefits', 'breadcrumb.vacation-balances'] } },
  { path: '', redirectTo: 'catalog', pathMatch: 'full' }
];
