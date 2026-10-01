import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Office} from '../domain/model/office.entity';
import {OfficeLocation} from '../domain/model/office-location';
import {OfficeResource,OfficesResponse} from './offices-response';

export class OfficeAssembler implements BaseAssembler<Office,OfficeResource,OfficesResponse>{
    toEntityFromResource(r:OfficeResource):Office{
        return new Office({id:r.id,name:r.name,location:new OfficeLocation({building:r.building,floor:r.floor,reference:r.locationReference}),active:r.active});
    }

    toResourceFromEntity(e:Office):OfficeResource{
        return{id:e.id,name:e.name,building:e.location.building,floor:e.location.floor,locationReference:e.location.reference,active:e.active};
    }

    toEntitiesFromResponse(r:OfficesResponse):Office[]{
        return r.offices.map(x=>this.toEntityFromResource(x));
    }
}