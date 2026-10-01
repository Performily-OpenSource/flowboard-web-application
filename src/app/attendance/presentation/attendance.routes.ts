import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/guards/role.guard';

const records = () => import('./views/attendance-records/attendance-records').then(m => m.AttendanceRecords);
const myAttendance = () => import('./views/my-attendance/my-attendance').then(m => m.MyAttendance);
const summary = () => import('./views/attendance-summary/attendance-summary').then(m => m.AttendanceSummary);
const hours = () => import('./views/attendance-hours/attendance-hours').then(m => m.AttendanceHours);

export const attendanceRoutes: Routes = [
  {path:'records', loadComponent: records, canActivate:[roleGuard], data:{breadcrumb:['breadcrumb.attendance','breadcrumb.attendance-records'], roles:['HR_STAFF']}},
  {path:'my-attendance', loadComponent: myAttendance, data:{breadcrumb:['breadcrumb.my-attendance']}},
  {path:'summary', loadComponent: summary, canActivate:[roleGuard], data:{breadcrumb:['breadcrumb.attendance','breadcrumb.attendance-summary'], roles:['HR_STAFF']}},
  {path:'hours', loadComponent: hours, canActivate:[roleGuard], data:{breadcrumb:['breadcrumb.attendance','breadcrumb.attendance-hours'], roles:['HR_STAFF']}},
  {path:'', redirectTo:'records', pathMatch:'full'}
];
