import {BaseEntity} from '../domain/model/base-entity';
import {BaseResource, BaseResponse} from './base-response';
import {BaseAssembler} from './base-assembler';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';

/**
 * Base class of the REST endpoints of every bounded context.
 *
 * @remarks Implements the CRUD operations over one resource collection and uses an assembler to convert resources into entities.
 * @author Oscar Lizandro Vasquez Llave
 */
export abstract class BaseApiEndpoint <
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>
  > {
  /**
   * Creates the endpoint.
   *
   * @param http        - Angular HttpClient.
   * @param endpointUrl - Full URL of the resource collection.
   * @param assembler   - Assembler that converts resources into entities and back.
   * @author Oscar Lizandro Vasquez Llave
   */
  protected constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler
  ) {  }

  /**
   * Builds the error handler used by every request.
   *
   * @param operation - Description of the failed operation.
   * @returns A function that turns an HttpErrorResponse into an Error with a readable message.
   * @author Oscar Lizandro Vasquez Llave
   */
  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = operation;
      if (error.status === 404) {
        errorMessage = `Resource not found: ${operation}`;
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = `An error occurred ${operation}: ${error.error.message}`;
      } else {
        errorMessage = `${operation}: ${error.statusText || 'Unexpected error'}`;
      }
      return throwError(() => new Error(errorMessage));
    }
  }

  /**
   * Deletes a resource.
   *
   * @param id - Id of the resource.
   * @returns An observable that completes when the resource is deleted.
   * @author Oscar Lizandro Vasquez Llave
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`).pipe(
      catchError(this.handleError('Failed to delete entity'))
    );
  }

  /**
   * Replaces a resource with the data of an entity.
   *
   * @param entity - Entity with the new data.
   * @param id     - Id of the resource.
   * @returns An observable with the updated entity.
   * @author Oscar Lizandro Vasquez Llave
   */
  update(entity: TEntity, id: number): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update entity'))
    );
  }

  /**
   * Creates a resource from an entity.
   *
   * @param entity - Entity to create.
   * @returns An observable with the created entity, including the id given by the API.
   * @author Oscar Lizandro Vasquez Llave
   */
  create(entity: TEntity): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.post<TResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create entity'))
    );
  }

  /**
   * Retrieves every resource of the collection.
   *
   * @remarks Accepts both a plain array and a wrapped response.
   * @returns An observable with the list of entities.
   * @author Oscar Lizandro Vasquez Llave
   */
  getAll(): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response.map(resource => this.assembler.toEntityFromResource(resource));
        }
        return this.assembler.toEntitiesFromResponse(response as TResponse);
      }),
      catchError(this.handleError('Failed to get entities'))
    );
  }

  /**
   * Retrieves one resource by its id.
   *
   * @param id - Id of the resource.
   * @returns An observable with the entity.
   * @author Oscar Lizandro Vasquez Llave
   */
  getById(id: number): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to get entity'))
    );
  }
}