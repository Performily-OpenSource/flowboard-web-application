import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Request} from '../domain/model/request.entity';
import {RequestType} from '../domain/model/request-type.entity';
import {RequestsApiEndpoint} from './requests-api-endpoint';
import {RequestTypesApiEndpoint} from './request-types-api-endpoint';

@Injectable({providedIn: 'root'})
export class RequestApi extends BaseApi {
  private readonly requestsEndpoint: RequestsApiEndpoint;
  private readonly requestTypesEndpoint: RequestTypesApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.requestsEndpoint = new RequestsApiEndpoint(http);
    this.requestTypesEndpoint = new RequestTypesApiEndpoint(http);
  }

  getRequests(): Observable<Request[]> {
    return this.requestsEndpoint.getAll();
  }

  createRequest(request: Request): Observable<Request> {
    return this.requestsEndpoint.create(request);
  }

  updateRequest(request: Request): Observable<Request> {
    return this.requestsEndpoint.update(request, request.id);
  }

  getRequestTypes(): Observable<RequestType[]> {
    return this.requestTypesEndpoint.getAll();
  }

  createRequestType(requestType: RequestType): Observable<RequestType> {
    return this.requestTypesEndpoint.create(requestType);
  }

  updateRequestType(requestType: RequestType): Observable<RequestType> {
    return this.requestTypesEndpoint.update(requestType, requestType.id);
  }

  deleteRequestType(id: number): Observable<void> {
    return this.requestTypesEndpoint.delete(id);
  }
}
