import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {routes} from './app.routes';
import {EMPLOYEE_FILE_SECTIONS} from './shared/presentation/components/employee-file-section/employee-file-section';
import {EmployeeBenefitsTab} from './benefits/presentation/components/employee-benefits-tab/employee-benefits-tab';
import {VacationBalanceCard} from './benefits/presentation/components/vacation-balance-card/vacation-balance-card';
import {EmployeeRequestsTab} from './request/presentation/components/employee-requests-tab/employee-requests-tab';
import {LatestRequestsCard} from './request/presentation/components/latest-requests-card/latest-requests-card';
import {EmployeeAttendanceTab} from './attendance/presentation/components/employee-attendance-tab/employee-attendance-tab';
import {EmployeeAttendanceEmployment} from './attendance/presentation/components/employee-attendance-employment/employee-attendance-employment';
import {DASHBOARD_WIDGETS} from './shared/presentation/components/dashboard-widget/dashboard-widget';
import {ActiveEmployeesKpi} from './workspace/presentation/components/active-employees-kpi/active-employees-kpi';
import {PendingRequestsKpi} from './request/presentation/components/pending-requests-kpi/pending-requests-kpi';
import {RequestsToAttendCard} from './request/presentation/components/requests-to-attend-card/requests-to-attend-card';
import {MyRequestsCard} from './request/presentation/components/my-requests-card/my-requests-card';
import {MonthlyLatesKpi} from './attendance/presentation/components/monthly-lates-kpi/monthly-lates-kpi';
import {TodayAttendanceCard} from './attendance/presentation/components/today-attendance-card/today-attendance-card';
import {MyWeekAttendanceCard} from './attendance/presentation/components/my-week-attendance-card/my-week-attendance-card';
import {VacationDaysKpi} from './benefits/presentation/components/vacation-days-kpi/vacation-days-kpi';
import {MyVacationBalanceCard} from './benefits/presentation/components/my-vacation-balance-card/my-vacation-balance-card';
import {MyLatestPayslipCard} from './payroll/presentation/components/my-latest-payslip-card/my-latest-payslip-card';
import {MyBenefitsCard} from './benefits/presentation/components/my-benefits-card/my-benefits-card';
import {MyPositionCard} from './workspace/presentation/components/my-position-card/my-position-card';
import {OfficeWellbeingCard} from './wellbeing/presentation/components/office-wellbeing-card/office-wellbeing-card';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
      fallbackLang: 'en',
    }),
    provideRouter(routes),
    { provide: EMPLOYEE_FILE_SECTIONS, multi: true, useValue: { slot: 'benefits-tab', order: 1, component: EmployeeBenefitsTab } },
    { provide: EMPLOYEE_FILE_SECTIONS, multi: true, useValue: { slot: 'aside', order: 1, component: VacationBalanceCard } },
    { provide: EMPLOYEE_FILE_SECTIONS, multi: true, useValue: { slot: 'requests-tab', order: 1, component: EmployeeRequestsTab } },
    { provide: EMPLOYEE_FILE_SECTIONS, multi: true, useValue: { slot: 'aside', order: 2, component: LatestRequestsCard } },
    { provide: EMPLOYEE_FILE_SECTIONS, multi: true, useValue: { slot: 'attendance-tab', order: 1, component: EmployeeAttendanceTab } },
    { provide: EMPLOYEE_FILE_SECTIONS, multi: true, useValue: { slot: 'employment', order: 1, component: EmployeeAttendanceEmployment } },

    // Widgets of the home dashboards: HR dashboard (WA-02) and collaborator home (WA-10)
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'hr', slot: 'kpi', order: 1, component: ActiveEmployeesKpi } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'hr', slot: 'kpi', order: 2, component: PendingRequestsKpi } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'hr', slot: 'kpi', order: 3, component: MonthlyLatesKpi } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'hr', slot: 'kpi', order: 4, component: VacationDaysKpi } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'hr', slot: 'column-1', order: 1, component: RequestsToAttendCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'hr', slot: 'column-2', order: 1, component: TodayAttendanceCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'hr', slot: 'column-2', order: 2, component: OfficeWellbeingCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'employee', slot: 'column-1', order: 1, component: MyVacationBalanceCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'employee', slot: 'column-2', order: 1, component: MyRequestsCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'employee', slot: 'column-1', order: 2, component: MyBenefitsCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'employee', slot: 'column-2', order: 2, component: MyPositionCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'employee', slot: 'column-3', order: 1, component: MyWeekAttendanceCard } },
    { provide: DASHBOARD_WIDGETS, multi: true, useValue: { dashboard: 'employee', slot: 'column-3', order: 2, component: MyLatestPayslipCard } }
  ]
};
