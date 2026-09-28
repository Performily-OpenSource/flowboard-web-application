import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Area} from '../domain/model/area.entity';
import {AreaResource, AreasResponse} from './areas-response';

export class AreaAssembler implements BaseAssembler<Area, AreaResource, AreasResponse> {

  toEntityFromResource(resource: AreaResource): Area {
    return new Area({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      active: resource.active
    });
  }

  toResourceFromEntity(entity: Area): AreaResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      active: entity.active
    } as AreaResource;
  }

  toEntitiesFromResponse(response: AreasResponse): Area[] {
    return response.areas.map(resource => this.toEntityFromResource(resource));
  }
}
