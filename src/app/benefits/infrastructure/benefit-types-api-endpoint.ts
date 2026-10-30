import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BenefitType} from '../domain/model/benefit-type.entity';
import {BenefitTypeResource, BenefitTypesResponse} from './benefit-types-response';
import {BenefitTypeAssembler} from './benefit-type-assembler';
import {handleBenefitsWebServiceError} from './benefits-web-service-error';

/**
 * HTTP endpoint of the benefit catalog in the Flowboard Web Service (/benefit-types).
 *
 * @remarks Besides reading the catalog, it exposes one method per action of the web service: create,
 * activate and deactivate. The web service never deletes a type and has no PUT yet, so a benefit
 * cannot be edited.
 * @author Salym
 */
export class BenefitTypesApiEndpoint
  extends BaseApiEndpoint<BenefitType, BenefitTypeResource, BenefitTypesResponse, BenefitTypeAssembler> {

  /**
   * Initializes the endpoint with the benefit types URL of the web service.
   * @param http Angular HTTP client used to call the API.
   * @author Salym
   */
  constructor(http: HttpClient) {
    super(http, `${environment.webServiceApiBaseUrl}${environment.platformProviderBenefitTypesEndpointPath}`,
      new BenefitTypeAssembler());
  }

  /**
   * Keeps the reason sent by the web service in the error.
   * @param operation Description of the operation.
   * @author Salym
   */
  protected override handleError(operation: string) {
    return handleBenefitsWebServiceError(operation);
  }

  /**
   * Creates a benefit type (POST /benefit-types).
   * @param benefitType Benefit type to create.
   * @returns An observable with the created benefit type
   * @author Salym
   */
  createBenefitType(benefitType: BenefitType): Observable<BenefitType> {
    return this.http.post<BenefitTypeResource>(this.endpointUrl, this.assembler.toCreateResourceFromEntity(benefitType)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create benefit type'))
    );
  }

  /**
   * Activates a benefit type (PATCH /benefit-types/{id}/activate).
   * @param id Identifier of the benefit type.
   * @returns An observable with the updated benefit type
   * @author Salym
   */
  activate(id: number): Observable<BenefitType> {
    return this.runAction(id, 'activate', 'Failed to activate benefit type');
  }

  /**
   * Deactivates a benefit type (PATCH /benefit-types/{id}/deactivate).
   * @param id Identifier of the benefit type.
   * @returns An observable with the updated benefit type
   * @author Salym
   */
  deactivate(id: number): Observable<BenefitType> {
    return this.runAction(id, 'deactivate', 'Failed to deactivate benefit type');
  }

  /**
   * Sends an action of the catalog and converts the answer to an entity.
   * @param id Identifier of the benefit type.
   * @param action Last segment of the URL, e.g. 'activate'.
   * @param operation Description used in the error message.
   * @author Salym
   */
  private runAction(id: number, action: string, operation: string): Observable<BenefitType> {
    return this.http.patch<BenefitTypeResource>(`${this.endpointUrl}/${id}/${action}`, null).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(operation))
    );
  }
}
