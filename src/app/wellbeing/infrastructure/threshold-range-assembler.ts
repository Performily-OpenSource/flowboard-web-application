import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ThresholdRange} from '../domain/model/threshold-range.entity';
import {ThresholdRangeResource,ThresholdRangesResponse} from './threshold-ranges-response';

/**
 * Transforms threshold range resources between infrastructure and domain entities.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class ThresholdRangeAssembler implements BaseAssembler<ThresholdRange,ThresholdRangeResource,ThresholdRangesResponse>{
/**
 * Converts an API resource into a domain entity.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
    toEntityFromResource(r:ThresholdRangeResource):ThresholdRange{
        return new ThresholdRange({id:r.id,metricThresholdId:r.metricThresholdId,indicator:r.healthIndicator,minValue:r.minValue,maxValue:r.maxValue});
    }

/**
 * Converts a domain entity into an API resource.
 * @param e Parameter used by the operation.
 * @author Diana Li
 */
    toResourceFromEntity(e:ThresholdRange):ThresholdRangeResource{
        return{id:e.id,metricThresholdId:e.metricThresholdId,healthIndicator:e.indicator,minValue:e.minValue,maxValue:e.maxValue};
    }

/**
 * Converts an API response into a collection of entities.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
    toEntitiesFromResponse(r:ThresholdRangesResponse):ThresholdRange[]{
        return r.thresholdRanges.map(x=>this.toEntityFromResource(x));
    }
}