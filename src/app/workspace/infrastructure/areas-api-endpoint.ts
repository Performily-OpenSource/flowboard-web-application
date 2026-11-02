import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {Area} from '../domain/model/area.entity';
import {AreaResource, AreasResponse} from './areas-response';
import {AreaAssembler} from './area-assembler';
import {WorkspaceApiEndpoint, workspaceApiUrl} from './workspace-api-endpoint';

/**
 * API endpoint for the Area resource, targeting GET/POST /api/v1/areas, PUT /api/v1/areas/{id} (rename)
 * and PATCH /api/v1/areas/{id}/activate|deactivate of the flowboard-web-service.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class AreasApiEndpoint extends WorkspaceApiEndpoint<Area, AreaResource, AreasResponse, AreaAssembler> {

  /**
   * Creates the endpoint with the /areas URL and an AreaAssembler.
   *
   * @param http - The Angular HttpClient used to perform the requests.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(http: HttpClient) {
    super(http, workspaceApiUrl('/areas'), new AreaAssembler());
  }

  /**
   * Creates an area (name and description).
   *
   * @param area - The area to create.
   * @returns An observable with the created area
   * @author Oscar Lizandro Vasquez Llave
   */
  override create(area: Area): Observable<Area> {
    return this.http.post<AreaResource>(this.endpointUrl, this.assembler.toCreateRequestFromEntity(area)).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create area'))
    );
  }

  /**
   * Renames an area. The API only allows changing the name.
   *
   * @param area - The area with the new name.
   * @param id   - The identifier of the area.
   * @returns An observable with the renamed area
   * @author Oscar Lizandro Vasquez Llave
   */
  override update(area: Area, id: number): Observable<Area> {
    return this.http.put<AreaResource>(`${this.endpointUrl}/${id}`, this.assembler.toRenameRequestFromEntity(area)).pipe(
      map(renamed => this.assembler.toEntityFromResource(renamed)),
      catchError(this.handleError('Failed to rename area'))
    );
  }

  /**
   * Activates an area.
   *
   * @param id - The identifier of the area.
   * @returns An observable with the area
   * @author Oscar Lizandro Vasquez Llave
   */
  activate(id: number): Observable<Area> {
    return this.http.patch<AreaResource>(`${this.endpointUrl}/${id}/activate`, {}).pipe(
      map(area => this.assembler.toEntityFromResource(area)),
      catchError(this.handleError('Failed to activate area'))
    );
  }

  /**
   * Deactivates an area. The API rejects it while the area has ACTIVE employees.
   *
   * @param id - The identifier of the area.
   * @returns An observable with the area
   * @author Oscar Lizandro Vasquez Llave
   */
  deactivate(id: number): Observable<Area> {
    return this.http.patch<AreaResource>(`${this.endpointUrl}/${id}/deactivate`, {}).pipe(
      map(area => this.assembler.toEntityFromResource(area)),
      catchError(this.handleError('Failed to deactivate area'))
    );
  }
}
