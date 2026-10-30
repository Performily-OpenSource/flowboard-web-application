import {VacationBalance} from '../domain/model/vacation-balance.entity';
import {VacationMovement, VacationMovementType} from '../domain/model/vacation-movement.entity';
import {VacationBalanceResource, VacationMovementResource} from './vacation-balances-response';

/**
 * Transforms vacation balance resources of the web service into domain entities, including their
 * movements.
 *
 * @remarks It does not implement BaseAssembler because the web service identifies a balance by its
 * employee and has no id; the entity uses the employeeId as its id. Balances are never sent back:
 * every change goes through an action of the web service.
 * @author Salym
 */
export class VacationBalanceAssembler {

  /**
   * Converts an API resource into a domain entity.
   * @param resource Resource received from the web service.
   * @param movements Movements to use instead of the ones of the resource (the list of balances
   *   sends them empty).
   * @author Salym
   */
  toEntityFromResource(resource: VacationBalanceResource, movements?: VacationMovementResource[]): VacationBalance {
    return new VacationBalance({
      id: resource.employeeId,
      employeeId: resource.employeeId,
      accruedDays: Number(resource.accruedDays),
      usedDays: Number(resource.usedDays),
      movements: this.toMovementsFromResources(movements ?? resource.movements ?? [])
    });
  }

  /**
   * Converts a list of resources of the web service into entities.
   * @param resources Resources received from the web service.
   * @author Salym
   */
  toEntitiesFromResources(resources: VacationBalanceResource[]): VacationBalance[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts the movements of the web service into entities of the balance.
   * @param resources Movements received from the web service.
   * @author Salym
   */
  toMovementsFromResources(resources: VacationMovementResource[]): VacationMovement[] {
    return resources.map(movement => new VacationMovement({
      id: movement.id,
      type: movement.type as VacationMovementType,
      days: Number(movement.days),
      reason: movement.reason ?? '',
      authorId: movement.authorId,
      requestId: movement.requestId,
      occurredAt: movement.occurredAt
    }));
  }
}
