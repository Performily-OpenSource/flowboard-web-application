import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import { EnvironmentalReading } from '../domain/model/environmental-reading.entity';
import { ReadingResource,EnvironmentalReadingsResponse } from './environmental-readings-response';
import { EnvironmentalReadingAssembler } from './environmental-reading-assembler';

export class EnvironmentalReadingsApiEndpoint extends BaseApiEndpoint<EnvironmentalReading,ReadingResource,EnvironmentalReadingsResponse,EnvironmentalReadingAssembler> {
    constructor(http:HttpClient){
        super(http,`${environment.platformProviderApiBaseUrl}${environment.platformProviderReadingsEndpointPath}`,new EnvironmentalReadingAssembler());
    }
}