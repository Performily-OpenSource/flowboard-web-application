import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/guards/role.guard';

const payrollList = () => import('./views/payroll-list/payroll-list').then(m => m.PayrollList);
const myPayslips = () => import('./views/my-payslips/my-payslips').then(m => m.MyPayslips);
const payslipUpload = () => import('./views/payslip-upload/payslip-upload').then(m => m.PayslipUpload);

export const payrollRoutes: Routes = [
  {path: 'payslips/upload', loadComponent: payslipUpload, canActivate:[roleGuard], data: {breadcrumb: ['breadcrumb.payroll', 'payroll.upload-page'], roles:['HR_STAFF']}},
  {path: 'payslips', loadComponent: payrollList, canActivate:[roleGuard], data: {breadcrumb: ['breadcrumb.payroll'], roles:['HR_STAFF']}},
  {path: 'my-payslips', loadComponent: myPayslips, data: {breadcrumb: ['breadcrumb.my-payslips']}},
  {path: '', redirectTo: 'payslips', pathMatch: 'full'}
];
