/**
 * Represents the employee information required for payroll operations.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @author Diana Li
 */
export class PayrollEmployee {
  readonly id: number;
  readonly fullName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly document: string;
  readonly areaId: number;
  readonly areaName: string;
  readonly positionTitle: string;
  readonly active: boolean;

  constructor(props: {
    id: number;
    fullName: string;
    firstName: string;
    lastName: string;
    document: string;
    areaId: number;
    areaName: string;
    positionTitle: string;
    active: boolean;
  }) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.document = props.document;
    this.areaId = props.areaId;
    this.areaName = props.areaName;
    this.positionTitle = props.positionTitle;
    this.active = props.active;
  }

  get identityDocumentNumber(): string { return this.document; }

  get area(): {id: number; name: string} { return {id: this.areaId, name: this.areaName}; }

  get position(): {title: string} { return {title: this.positionTitle}; }
/**
 * Executes the isActive operation of the component.
 * @author Diana Li
 */
  isActive(): boolean { return this.active; }
}
