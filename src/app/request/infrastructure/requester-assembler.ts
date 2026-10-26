import {environment} from '../../../environments/environment';
import {Requester} from '../domain/model/requester.entity';
import {WorkspaceEmployeeResource} from './workspace-employees-response';

/**
 * Translates the employees of Workspace to the Requester read model of Request.
 *
 * @remarks Part of the anti-corruption layer: Request only keeps what it needs from an employee
 * (name, area, position, direct manager, whether it is active and whether it is Human Resources staff).
 * @author Diego Alonso Diaz Villalba
 */
export class RequesterAssembler {

  /**
   * Converts an employee of Workspace to a Requester.
   *
   * @remarks An employee is Human Resources staff when it is active and belongs to environment.humanResourcesAreaId.
   * @param resource - The employee returned by the web service.
   * @returns The requester
   * @author Diego Alonso Diaz Villalba
   */
  toEntityFromResource(resource: WorkspaceEmployeeResource): Requester {
    const active = resource.status === 'ACTIVE';
    return new Requester({
      id: resource.id,
      fullName: resource.fullName,
      initials: `${resource.firstName.charAt(0)}${resource.lastName.charAt(0)}`.toUpperCase(),
      positionTitle: resource.positionTitle ?? '-',
      areaId: resource.areaId,
      areaName: resource.areaName ?? '-',
      directManagerId: resource.directManagerId,
      active,
      hrStaff: active && resource.areaId === environment.humanResourcesAreaId
    });
  }

  /**
   * Converts a list of employees to Requesters.
   *
   * @param resources - The employees returned by the web service.
   * @returns The Requesters
   * @author Diego Alonso Diaz Villalba
   */
  toEntitiesFromResources(resources: WorkspaceEmployeeResource[]): Requester[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}
