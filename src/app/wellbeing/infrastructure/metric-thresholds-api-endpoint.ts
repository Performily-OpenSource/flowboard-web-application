import {HttpClient} from '@angular/common/http'; 
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint'; 
import {environment} from '../../../environments/environment'; 
import { MetricThreshold } from '../domain/model/metric-threshold.entity'; 
import { ThresholdResource,MetricThresholdsResponse } from './metric-thresholds-response'; 
import { MetricThresholdAssembler } from './metric-threshold-assembler';

export class MetricThresholdsApiEndpoint extends BaseApiEndpoint<MetricThreshold,ThresholdResource,MetricThresholdsResponse,MetricThresholdAssembler> { 
    constructor(http:HttpClient){
        super(http,`${environment.platformProviderApiBaseUrl}${environment.platformProviderMetricThresholdsEndpointPath}`,new MetricThresholdAssembler());
    } 
}
