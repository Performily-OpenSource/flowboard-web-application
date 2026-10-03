import {HttpClient} from '@angular/common/http'; 
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint'; 
import {environment} from '../../../environments/environment'; 
import { MetricThreshold } from '../domain/model/metric-threshold.entity'; 
import { ThresholdResource,MetricThresholdsResponse } from './metric-thresholds-response'; 
import { MetricThresholdAssembler } from './metric-threshold-assembler';

/**
 * Encapsulates HTTP endpoints related to metric thresholds.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class MetricThresholdsApiEndpoint extends BaseApiEndpoint<MetricThreshold,ThresholdResource,MetricThresholdsResponse,MetricThresholdAssembler> { 
/**
 * Initializes the instance with the data required for operation.
 * @param http Parameter used by the operation.
 * @author Diana Li
 */
    constructor(http:HttpClient){
/**
 * Executes the super operation of the component.
 * @param http Parameter used by the operation.
 * @param new Parameter used by the operation.
 * @author Diana Li
 */
        super(http,`${environment.platformProviderApiBaseUrl}${environment.platformProviderMetricThresholdsEndpointPath}`,new MetricThresholdAssembler());
    } 
}
