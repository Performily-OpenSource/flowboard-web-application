import {Routes} from '@angular/router';

const payrollList = () => import('./views/payroll-list/payroll-list').then(m => m.PayrollList);
const myPayslips = () => import('./views/my-payslips/my-payslips').then(m => m.MyPayslips);

export const payrollRoutes: Routes = [
  {path: 'payslips', loadComponent: payrollList, data: {breadcrumb: ['breadcrumb.payroll']}},
  {path: 'my-payslips', loadComponent: myPayslips, data: {breadcrumb: ['breadcrumb.my-payslips']}},
  {path: '', redirectTo: 'payslips', pathMatch: 'full'}
];
