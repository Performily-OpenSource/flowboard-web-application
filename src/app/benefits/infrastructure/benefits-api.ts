import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitAssignment} from '../domain/model/benefit-assignment.entity';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {BenefitTypesApiEndpoint} from './benefit-types-api-endpoint';
import {BenefitAssignmentsApiEndpoint} from './benefit-assignments-api-endpoint';
import {VacationBalancesApiEndpoint} from './vacation-balances-api-endpoint';

@Injectable({providedIn: 'root'})
export class BenefitsApi extends BaseApi {
  private readonly benefitTypesEndpoint: BenefitTypesApiEndpoint;
  private readonly benefitAssignmentsEndpoint: BenefitAssignmentsApiEndpoint;
  private readonly vacationBalancesEndpoint: VacationBalancesApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.benefitTypesEndpoint = new BenefitTypesApiEndpoint(http);
    this.benefitAssignmentsEndpoint = new BenefitAssignmentsApiEndpoint(http);
    this.vacationBalancesEndpoint = new VacationBalancesApiEndpoint(http);
  }

  getBenefitTypes(): Observable<BenefitType[]> {
    return this.benefitTypesEndpoint.getAll();
  }

  createBenefitType(benefitType: BenefitType): Observable<BenefitType> {
    return this.benefitTypesEndpoint.create(benefitType);
  }

  updateBenefitType(benefitType: BenefitType): Observable<BenefitType> {
    return this.benefitTypesEndpoint.update(benefitType, benefitType.id);
  }

  getBenefitAssignments(): Observable<BenefitAssignment[]> {
    return this.benefitAssignmentsEndpoint.getAll();
  }

  createBenefitAssignment(assignment: BenefitAssignment): Observable<BenefitAssignment> {
    return this.benefitAssignmentsEndpoint.create(assignment);
  }

  updateBenefitAssignment(assignment: BenefitAssignment): Observable<BenefitAssignment> {
    return this.benefitAssignmentsEndpoint.update(assignment, assignment.id);
  }

  getVacationBalances(): Observable<VacationBalance[]> {
    return this.vacationBalancesEndpoint.getAll();
  }

  updateVacationBalance(balance: VacationBalance): Observable<VacationBalance> {
    return this.vacationBalancesEndpoint.update(balance, balance.id);
  }
}
