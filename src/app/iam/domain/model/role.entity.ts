import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * Defines the roles supported by the IAM bounded context.
 *
 * @remarks Restricts account roles to Human Resources staff and employee access levels.
 * @author Dario Avila de la cruz
 */
export type RoleType = 'HR_STAFF' | 'EMPLOYEE';

/**
 * Represents a role available to an IAM account.
 *
 * @remarks Models the role identity used to determine the access level assigned to an account.
 * @author Dario Avila de la cruz
 */
export class Role implements BaseEntity {
  id: number;
  name: RoleType;

/**
 * Performs the constructor operation.
 *
 * @param props the properties used to initialize the entity.
 * @author Dario Avila de la cruz
 */
  constructor(props: { id: number; name: RoleType }) {
    this.id = props.id;
    this.name = props.name;
  }

  getStringName(): string {
    return this.name;
  }

  static getDefaultRole(): RoleType {
    return 'EMPLOYEE';
  }
}
