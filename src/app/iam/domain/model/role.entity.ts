import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type RoleType = 'HR_STAFF' | 'EMPLOYEE';

export class Role implements BaseEntity {
  id: number;
  name: RoleType;

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
