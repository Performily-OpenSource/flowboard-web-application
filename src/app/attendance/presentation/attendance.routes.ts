import {Routes} from '@angular/router';

const records = () => import('./views/attendance-records/attendance-records').then(m => m.AttendanceRecords);
const myAttendance = () => import('./views/my-attendance/my-attendance').then(m => m.MyAttendance);
const summary = () => import('./views/attendance-summary/attendance-summary').then(m => m.AttendanceSummary);
const hours = () => import('./views/attendance-hours/attendance-hours').then(m => m.AttendanceHours);

export const attendanceRoutes: Routes = [
  {path:'records', loadComponent: records, data:{breadcrumb:['breadcrumb.attendance','breadcrumb.attendance-records']}},
  {path:'my-attendance', loadComponent: myAttendance, data:{breadcrumb:['breadcrumb.my-attendance']}},
  {path:'summary', loadComponent: summary, data:{breadcrumb:['breadcrumb.attendance','breadcrumb.attendance-summary']}},
  {path:'hours', loadComponent: hours, data:{breadcrumb:['breadcrumb.attendance','breadcrumb.attendance-hours']}},
  {path:'', redirectTo:'records', pathMatch:'full'}
];
