import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';
import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationBalancesApiEndpoint} from './vacation-balances-api-endpoint';
import {VacationBalanceAssembler} from './vacation-balance-assembler';
import {VacationBalanceResource} from './vacation-balances-response';
import {environment} from '../../../environments/environment';

interface VacationMovementResource {
  id: number;
  type: string;
  days: number;
  reason: string;
  authorId: number | null;
  requestId: number | null;
  occurredAt: string;
}

@Injectable({providedIn: 'root'})
export class BenefitsAcl {
  private readonly vacationBalancesEndpoint: VacationBalancesApiEndpoint;
  private readonly assembler = new VacationBalanceAssembler();
  private readonly url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVacationBalancesEndpointPath}`;

  constructor(private http: HttpClient) {
    this.vacationBalancesEndpoint = new VacationBalancesApiEndpoint(http);
  }

  getVacationBalances(): Observable<VacationBalance[]> {
    return this.vacationBalancesEndpoint.getAll();
  }

  debitVacationDays(balance: VacationBalance, days: number, requestId: number): Observable<VacationBalance> {
    return this.http.get<VacationBalanceResource & { movements?: VacationMovementResource[] }>(`${this.url}/${balance.id}`).pipe(
      switchMap(current => {
        const movements = current.movements ?? [];
        const movement: VacationMovementResource = {
          id: Date.now(),
          type: 'USAGE',
          days: -days,
          reason: 'Approved vacation request',
          authorId: null,
          requestId,
          occurredAt: new Date().toISOString()
        };
        return this.http.patch<VacationBalanceResource>(`${this.url}/${balance.id}`, {
          usedDays: current.usedDays + days,
          movements: [...movements, movement]
        });
      }),
      map(resource => this.assembler.toEntityFromResource(resource))
    );
  }
}
