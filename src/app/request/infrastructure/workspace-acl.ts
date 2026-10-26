import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Requester} from '../domain/model/requester.entity';
import {RequestersApiEndpoint} from './requesters-api-endpoint';

/**
 * Anti-corruption layer from the Request bounded context to Workspace.
 *
 * @remarks
 * Reads the employees of Workspace from the Flowboard Web Service and translates them to the
 * Requester read model, so Request never uses the Workspace entities directly. The web service
 * already sends the area name and the position title of each employee, so one call is enough.
 *
 * @author Diego Alonso Diaz Villalba
 */
@Injectable({providedIn: 'root'})
export class WorkspaceAcl {
  /** Endpoint that reads the employees of Workspace. */
  private readonly requestersEndpoint: RequestersApiEndpoint;

  /**
   * Creates the ACL.
   *
   * @param http - The Angular HTTP client.
   * @author Diego Alonso Diaz Villalba
   */
  constructor(http: HttpClient) {
    this.requestersEndpoint = new RequestersApiEndpoint(http);
  }

  /**
   * Gets every employee as a Requester, with the name of its area and the title of its position.
   *
   * @returns An observable with the requesters
   * @author Diego Alonso Diaz Villalba
   */
  getRequesters(): Observable<Requester[]> {
    return this.requestersEndpoint.getAll();
  }
}
