import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {Payslip} from '../domain/model/payslip.entity';
import {PayrollPeriodsApiEndpoint} from './payroll-periods-api-endpoint';
import {PayslipsApiEndpoint} from './payslips-api-endpoint';

@Injectable({providedIn: 'root'})
export class PayrollApi extends BaseApi {
  private readonly periodsEndpoint: PayrollPeriodsApiEndpoint;
  private readonly payslipsEndpoint: PayslipsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.periodsEndpoint = new PayrollPeriodsApiEndpoint(http);
    this.payslipsEndpoint = new PayslipsApiEndpoint(http);
  }

  getPeriods(): Observable<PayrollPeriod[]> {
    return this.periodsEndpoint.getAll();
  }

  getPayslips(): Observable<Payslip[]> {
    return this.payslipsEndpoint.getAll();
  }

  createPayslip(payslip: Payslip): Observable<Payslip> {
    return this.payslipsEndpoint.create(payslip);
  }

  updatePayslip(payslip: Payslip): Observable<Payslip> {
    return this.payslipsEndpoint.update(payslip, payslip.id);
  }
}
