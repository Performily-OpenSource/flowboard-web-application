import {BaseAssembler} from '../../shared/infrastructure/base-assembler'; 
import {MetricThreshold} from '../domain/model/metric-threshold.entity'; 
import {ThresholdResource,MetricThresholdsResponse} from './metric-thresholds-response';

/**
 * Transforms threshold resources between infrastructure and domain entities.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class MetricThresholdAssembler implements BaseAssembler<MetricThreshold,ThresholdResource,MetricThresholdsResponse>{
/**
 * Converts an API resource into a domain entity.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
    toEntityFromResource(r:ThresholdResource):MetricThreshold{
        return new MetricThreshold(r.id,r.metricType,[]);
    }
/**
 * Converts a domain entity into an API resource.
 * @param e Parameter used by the operation.
 * @author Diana Li
 */
        toResourceFromEntity(e:MetricThreshold):ThresholdResource{return{
            id:e.id,metricType:e.metricType};
        }
/**
 * Converts an API response into a collection of entities.
 * @param r Parameter used by the operation.
 * @author Diana Li
 */
            toEntitiesFromResponse(r:MetricThresholdsResponse):MetricThreshold[]{return r.metricThresholds.map(x=>this.toEntityFromResource(x));}}
