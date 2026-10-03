import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {PayrollPeriod} from '../domain/model/payroll-period.entity';
import {Payslip} from '../domain/model/payslip.entity';
import {PayrollPeriodsApiEndpoint} from './payroll-periods-api-endpoint';
import {PayslipsApiEndpoint} from './payslips-api-endpoint';

@Injectable({providedIn: 'root'})
/**
 * Exposes the HTTP operations used by the Payroll context to retrieve and update information.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollApi extends BaseApi {
  private readonly periodsEndpoint: PayrollPeriodsApiEndpoint;
  private readonly payslipsEndpoint: PayslipsApiEndpoint;

/**
 * Initializes the instance with the data required for operation.
 * @param http Parameter used by the operation.
 * @author Diana Li
 */
  constructor(http: HttpClient) {
/**
 * Executes the super operation of the component.
 * @author Diana Li
 */
    super();
    this.periodsEndpoint = new PayrollPeriodsApiEndpoint(http);
    this.payslipsEndpoint = new PayslipsApiEndpoint(http);
  }

/**
 * Retrieves payroll periods.
 * @author Diana Li
 */
  getPeriods(): Observable<PayrollPeriod[]> {
    return this.periodsEndpoint.getAll();
  }

/**
 * Retrieves payslips.
 * @author Diana Li
 */
  getPayslips(): Observable<Payslip[]> {
    return this.payslipsEndpoint.getAll();
  }

/**
 * Creates a new payslip.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  createPayslip(payslip: Payslip): Observable<Payslip> {
    return this.payslipsEndpoint.create(payslip);
  }

/**
 * Updates a payslip.
 * @param payslip Parameter used by the operation.
 * @author Diana Li
 */
  updatePayslip(payslip: Payslip): Observable<Payslip> {
    return this.payslipsEndpoint.update(payslip, payslip.id);
  }
}
