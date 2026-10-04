import {BaseEntity} from '../domain/model/base-entity';
import {BaseResource, BaseResponse} from './base-response';

/**
 * Contract of the assemblers that convert API resources into domain entities and back.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface BaseAssembler<TEntity extends BaseEntity,
                               TResource extends BaseResource,
                               TResponse extends BaseResponse> {
  /**
   * Converts a resource into an entity.
   *
   * @param resource - Resource received from the API.
   * @returns The domain entity.
   */
  toEntityFromResource(resource: TResource): TEntity;

  /**
   * Converts an entity into a resource.
   *
   * @param entity - Domain entity.
   * @returns The resource sent to the API.
   */
  toResourceFromEntity(entity: TEntity): TResource;

  /**
   * Converts a wrapped API response into entities.
   *
   * @param response - Response received from the API.
   * @returns The list of domain entities.
   */
  toEntitiesFromResponse(response: TResponse): TEntity[];
}