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
    { provide: EMPLOYEE_FILE_SECTIONS, multi: true, useValue: { slot: 'aside', order: 2, component: LatestRequestsCard } }
  ]
};
