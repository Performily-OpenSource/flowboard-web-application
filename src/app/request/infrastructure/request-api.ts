import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Request} from '../domain/model/request.entity';
import {RequestType} from '../domain/model/request-type.entity';
import {RequestsApiEndpoint} from './requests-api-endpoint';
import {RequestTypesApiEndpoint} from './request-types-api-endpoint';

/**
 * API facade of the Request bounded context.
 * Groups the HTTP endpoints of requests and request types.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Injectable({providedIn: 'root'})
export class RequestApi extends BaseApi {
  private readonly requestsEndpoint: RequestsApiEndpoint;
  private readonly requestTypesEndpoint: RequestTypesApiEndpoint;

  /**
   * Creates the facade and its endpoints.
   *
   * @param http - The Angular HTTP client.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(http: HttpClient) {
    super();
    this.requestsEndpoint = new RequestsApiEndpoint(http);
    this.requestTypesEndpoint = new RequestTypesApiEndpoint(http);
  }

  /**
   * Gets all the requests.
   *
   * @returns An observable with the requests
   * @author Diego Alonso Diaz Villalba
   */
  getRequests(): Observable<Request[]> {
    return this.requestsEndpoint.getAll();
  }

  /**
   * Creates a request.
   *
   * @param request - The request to create.
   * @returns An observable with the created request
   * @author Diego Alonso Diaz Villalba
   */
  createRequest(request: Request): Observable<Request> {
    return this.requestsEndpoint.create(request);
  }

  /**
   * Updates a request, e.g. after a status change.
   *
   * @param request - The request with its new data.
   * @returns An observable with the updated request
   * @author Diego Alonso Diaz Villalba
   */
  updateRequest(request: Request): Observable<Request> {
    return this.requestsEndpoint.update(request, request.id);
  }

  /**
   * Gets all the request types.
   *
   * @returns An observable with the request types
   * @author Diego Alonso Diaz Villalba
   */
  getRequestTypes(): Observable<RequestType[]> {
    return this.requestTypesEndpoint.getAll();
  }

  /**
   * Creates a request type.
   *
   * @param requestType - The request type to create.
   * @returns An observable with the created request type
   * @author Diego Alonso Diaz Villalba
   */
  createRequestType(requestType: RequestType): Observable<RequestType> {
    return this.requestTypesEndpoint.create(requestType);
  }

  /**
   * Updates a request type.
   *
   * @param requestType - The request type with its new data.
   * @returns An observable with the updated request type
   * @author Diego Alonso Diaz Villalba
   */
  updateRequestType(requestType: RequestType): Observable<RequestType> {
    return this.requestTypesEndpoint.update(requestType, requestType.id);
  }

  /**
   * Deletes a request type.
   *
   * @param id - The request type identifier.
   * @returns An observable that completes when the type is deleted
   * @author Diego Alonso Diaz Villalba
   */
  deleteRequestType(id: number): Observable<void> {
    return this.requestTypesEndpoint.delete(id);
  }
}
