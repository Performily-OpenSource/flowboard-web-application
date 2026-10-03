import {HttpClient} from '@angular/common/http'; 
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint'; 
import {environment} from '../../../environments/environment'; 
import { ThresholdRange } from '../domain/model/threshold-range.entity'; 
import { ThresholdRangeResource,ThresholdRangesResponse } from './threshold-ranges-response'; 
import { ThresholdRangeAssembler } from './threshold-range-assembler';

/**
 * Encapsulates HTTP endpoints related to threshold ranges.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class ThresholdRangesApiEndpoint extends BaseApiEndpoint<ThresholdRange,ThresholdRangeResource,ThresholdRangesResponse,ThresholdRangeAssembler> { 
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
        super(http,`${environment.platformProviderApiBaseUrl}${environment.platformProviderThresholdRangesEndpointPath}`,new ThresholdRangeAssembler());
    } 
}
