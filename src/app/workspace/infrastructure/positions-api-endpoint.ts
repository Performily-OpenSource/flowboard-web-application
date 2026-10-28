import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {Position} from '../domain/model/position.entity';
import {PositionResource, PositionsResponse} from './positions-response';
import {PositionAssembler} from './position-assembler';
import {WorkspaceApiEndpoint, workspaceApiUrl} from './workspace-api-endpoint';

/**
 * API endpoint for the Position resource, targeting GET/POST /api/v1/positions,
 * PATCH /api/v1/positions/{id}/reference-salary and PATCH /api/v1/positions/{id}/deactivate
 * of the flowboard-web-service.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class PositionsApiEndpoint extends WorkspaceApiEndpoint<Position, PositionResource, PositionsResponse, PositionAssembler> {

  /**
   * Creates the endpoint with the /positions URL and a PositionAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, workspaceApiUrl('/positions'), new PositionAssembler());
  }

  /**
   * Creates a position.
   *
   * @param position - The position to create.
   * @returns An observable with the created position
   * @author Oscar Lizandro Vasquez Llave
   */
  override create(position: Position): Observable<Position> {
    return this.http.post<PositionResource>(this.endpointUrl, this.assembler.toCreateRequestFromEntity(position)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create position'))
    );
  }

  /**
   * Updates the reference salary of a position. The API does not allow changing the title or the area.
   *
   * @param position - The position with the new reference salary.
   * @param id       - The identifier of the position.
   * @returns An observable with the updated position
   * @author Oscar Lizandro Vasquez Llave
   */
  override update(position: Position, id: number): Observable<Position> {
    return this.http.patch<PositionResource>(
      `${this.endpointUrl}/${id}/reference-salary`,
      this.assembler.toReferenceSalaryRequestFromEntity(position)
    ).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update position'))
    );
  }

  /**
   * Deactivates a position.
   *
   * @param id - The identifier of the position.
   * @returns An observable with the position
   * @author Oscar Lizandro Vasquez Llave
   */
  deactivate(id: number): Observable<Position> {
    return this.http.patch<PositionResource>(`${this.endpointUrl}/${id}/deactivate`, {}).pipe(
      map(position => this.assembler.toEntityFromResource(position)),
      catchError(this.handleError('Failed to deactivate position'))
    );
  }
}
