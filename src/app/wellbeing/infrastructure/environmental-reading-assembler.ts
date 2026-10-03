import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {EnvironmentalReading} from '../domain/model/environmental-reading.entity';
import {MetricValue} from '../domain/model/metric-value';
import {ReadingResource,EnvironmentalReadingsResponse} from './environmental-readings-response';

/**
 * Transforms environmental reading resources between infrastructure and domain entities.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class EnvironmentalReadingAssembler implements BaseAssembler<EnvironmentalReading,ReadingResource,EnvironmentalReadingsResponse>{
/**
 * Converts an API resource into a domain entity.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
    toEntityFromResource(r:ReadingResource):EnvironmentalReading{
        return new EnvironmentalReading({id:r.id,officeId:r.officeId,deviceId:r.deviceId,measurement:new MetricValue(r.metricType,r.metricValue),recordedAt:r.recordedAt});
    }

/**
 * Converts a domain entity into an API resource.
 * @param e Parameter used by the operation.
 * @author Diana Li
 */
    toResourceFromEntity(e:EnvironmentalReading):ReadingResource{
        return{id:e.id,officeId:e.officeId,deviceId:e.deviceId,metricType:e.measurement.metricType,metricValue:e.measurement.value,recordedAt:e.recordedAt};
    }
    
/**
 * Converts an API response into a collection of entities.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
    toEntitiesFromResponse(r:EnvironmentalReadingsResponse):EnvironmentalReading[]{
        return r.environmentalReadings.map(x=>this.toEntityFromResource(x));
    }
}