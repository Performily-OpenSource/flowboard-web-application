import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Office} from '../domain/model/office.entity';
import {OfficeLocation} from '../domain/model/office-location';
import {OfficeResource,OfficesResponse} from './offices-response';

/**
 * Transforms office resources between infrastructure and domain entities.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class OfficeAssembler implements BaseAssembler<Office,OfficeResource,OfficesResponse>{
/**
 * Converts an API resource into a domain entity.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
    toEntityFromResource(r:OfficeResource):Office{
        return new Office({id:r.id,name:r.name,location:new OfficeLocation({building:r.building,floor:r.floor,reference:r.locationReference}),active:r.active});
    }

/**
 * Converts a domain entity into an API resource.
 * @param e Parameter used by the operation.
 * @author Diana Li
 */
    toResourceFromEntity(e:Office):OfficeResource{
        return{id:e.id,name:e.name,building:e.location.building,floor:e.location.floor,locationReference:e.location.reference,active:e.active};
    }

/**
 * Converts an API response into a collection of entities.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
    toEntitiesFromResponse(r:OfficesResponse):Office[]{
        return r.offices.map(x=>this.toEntityFromResource(x));
    }
}