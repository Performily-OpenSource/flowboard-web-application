import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Area} from '../domain/model/area.entity';
import {AreaResource, AreasResponse} from './areas-response';

/** Assembler that converts between AreaResource (API) and Area (domain entity). */
export class AreaAssembler implements BaseAssembler<Area, AreaResource, AreasResponse> {

  /**
   * Converts a AreaResource into a Area entity.
   *
   * @param resource - The resource returned by the API.
   * @returns The corresponding Area entity
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntityFromResource(resource: AreaResource): Area {
    return new Area({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      active: resource.active
    });
  }

  /**
   * Converts a Area entity into a AreaResource to be sent to the API.
   *
   * @param entity - The entity to convert.
   * @returns The corresponding AreaResource
   * @author Oscar Lizandro Vasquez Llave
   */
  toResourceFromEntity(entity: Area): AreaResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      active: entity.active
    } as AreaResource;
  }

  /**
   * Converts a AreasResponse into a list of Area entities.
   *
   * @param response - The response whose 'areas' array is converted.
   * @returns The list of Area entities
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntitiesFromResponse(response: AreasResponse): Area[] {
    return response.areas.map(resource => this.toEntityFromResource(resource));
  }
}
