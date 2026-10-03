import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import { EnvironmentalReading } from '../domain/model/environmental-reading.entity';
import { ReadingResource,EnvironmentalReadingsResponse } from './environmental-readings-response';
import { EnvironmentalReadingAssembler } from './environmental-reading-assembler';

/**
 * Encapsulates HTTP endpoints related to environmental readings.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class EnvironmentalReadingsApiEndpoint extends BaseApiEndpoint<EnvironmentalReading,ReadingResource,EnvironmentalReadingsResponse,EnvironmentalReadingAssembler> {
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
        super(http,`${environment.platformProviderApiBaseUrl}${environment.platformProviderReadingsEndpointPath}`,new EnvironmentalReadingAssembler());
    }
}