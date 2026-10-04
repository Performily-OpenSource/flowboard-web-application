import {Area} from './area.entity';
import {Position} from './position.entity';

/** Type of identity document an employee can register: DNI, CE (foreign resident card) or passport. */
export type IdentityDocumentType = 'DNI' | 'CE' | 'PASSPORT';
/** Type of employment contract held by an employee. */
export type ContractType = 'INDEFINITE' | 'FIXED_TERM' | 'PART_TIME' | 'INTERNSHIP';
/** Employment status of an employee within the company. */
export type EmploymentStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

/** All supported identity document types, e.g. for select options. */
export const IDENTITY_DOCUMENT_TYPES: IdentityDocumentType[] = ['DNI', 'CE', 'PASSPORT'];
/** All supported contract types, e.g. for select options. */
export const CONTRACT_TYPES: ContractType[] = ['INDEFINITE', 'FIXED_TERM', 'PART_TIME', 'INTERNSHIP'];
/** All supported employment statuses, e.g. for select options. */
export const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['ACTIVE', 'SUSPENDED', 'TERMINATED'];

/**
 * Aggregate root of the Workspace bounded context representing a company employee.
 * Holds personal, contact, address and contract data, the employment status (with termination
 * data when terminated) and references to the employee's area, position and optional direct manager.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class Employee {
  private _id: number;
  private _firstName: string;
  private _lastName: string;
  private _identityDocumentType: IdentityDocumentType;
  private _identityDocumentNumber: string;
  private _birthDate: string;
  private _email: string;
  private _phoneNumber: string;
  private _addressStreet: string;
  private _addressDistrict: string;
  private _addressProvince: string;
  private _addressDepartment: string;
  private _contractType: ContractType;
  private _hireDate: string;
  private _contractEndDate: string | null;
  private _status: EmploymentStatus;
  private _terminationReason: string | null;
  private _terminationDate: string | null;
  private _areaId: number;
  private _positionId: number;
  private _directManagerId: number | null;
  private _area: Area | null;
  private _position: Position | null;

  /**
   * Creates a new Employee.
   * Optional fields (contractEndDate, terminationReason, terminationDate, directManagerId, area, position) default to null.
   *
   * @param props - The employee data: identity, contact, address, contract, status and area/position/manager references.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(props: {
    id: number;
    firstName: string;
    lastName: string;
    identityDocumentType: IdentityDocumentType;
    identityDocumentNumber: string;
    birthDate: string;
    email: string;
    phoneNumber: string;
    addressStreet: string;
    addressDistrict: string;
    addressProvince: string;
    addressDepartment: string;
    contractType: ContractType;
    hireDate: string;
    contractEndDate?: string | null;
    status: EmploymentStatus;
    terminationReason?: string | null;
    terminationDate?: string | null;
    areaId: number;
    positionId: number;
    directManagerId?: number | null;
    area?: Area | null;
    position?: Position | null;
  }) {
    this._id = props.id;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._identityDocumentType = props.identityDocumentType;
    this._identityDocumentNumber = props.identityDocumentNumber;
    this._birthDate = props.birthDate;
    this._email = props.email;
    this._phoneNumber = props.phoneNumber;
    this._addressStreet = props.addressStreet;
    this._addressDistrict = props.addressDistrict;
    this._addressProvince = props.addressProvince;
    this._addressDepartment = props.addressDepartment;
    this._contractType = props.contractType;
    this._hireDate = props.hireDate;
    this._contractEndDate = props.contractEndDate ?? null;
    this._status = props.status;
    this._terminationReason = props.terminationReason ?? null;
    this._terminationDate = props.terminationDate ?? null;
    this._areaId = props.areaId;
    this._positionId = props.positionId;
    this._directManagerId = props.directManagerId ?? null;
    this._area = props.area ?? null;
    this._position = props.position ?? null;
  }

  /** Unique identifier of the employee. */
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  /** Employee first name. */
  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    this._firstName = value;
  }

  /** Employee last name. */
  get lastName(): string {
    return this._lastName;
  }

  set lastName(value: string) {
    this._lastName = value;
  }

  /** Type of the employee's identity document. */
  get identityDocumentType(): IdentityDocumentType {
    return this._identityDocumentType;
  }

  set identityDocumentType(value: IdentityDocumentType) {
    this._identityDocumentType = value;
  }

  /** Number of the employee's identity document. */
  get identityDocumentNumber(): string {
    return this._identityDocumentNumber;
  }

  set identityDocumentNumber(value: string) {
    this._identityDocumentNumber = value;
  }

  /** Birth date as a 'YYYY-MM-DD' string. */
  get birthDate(): string {
    return this._birthDate;
  }

  set birthDate(value: string) {
    this._birthDate = value;
  }

  /** Employee email address. */
  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  /** Employee phone number. */
  get phoneNumber(): string {
    return this._phoneNumber;
  }

  set phoneNumber(value: string) {
    this._phoneNumber = value;
  }

  /** Street part of the employee address. */
  get addressStreet(): string {
    return this._addressStreet;
  }

  set addressStreet(value: string) {
    this._addressStreet = value;
  }

  /** District part of the employee address. */
  get addressDistrict(): string {
    return this._addressDistrict;
  }

  set addressDistrict(value: string) {
    this._addressDistrict = value;
  }

  /** Province part of the employee address. */
  get addressProvince(): string {
    return this._addressProvince;
  }

  set addressProvince(value: string) {
    this._addressProvince = value;
  }

  /** Department (region) part of the employee address. */
  get addressDepartment(): string {
    return this._addressDepartment;
  }

  set addressDepartment(value: string) {
    this._addressDepartment = value;
  }

  /** Type of the employee's contract. */
  get contractType(): ContractType {
    return this._contractType;
  }

  set contractType(value: ContractType) {
    this._contractType = value;
  }

  /** Hire date as a 'YYYY-MM-DD' string. */
  get hireDate(): string {
    return this._hireDate;
  }

  set hireDate(value: string) {
    this._hireDate = value;
  }

  /** Contract end date as a 'YYYY-MM-DD' string, or null if the contract has no end date. */
  get contractEndDate(): string | null {
    return this._contractEndDate;
  }

  set contractEndDate(value: string | null) {
    this._contractEndDate = value;
  }

  /** Current employment status. */
  get status(): EmploymentStatus {
    return this._status;
  }

  set status(value: EmploymentStatus) {
    this._status = value;
  }

  /** Reason for termination, or null if the employee has not been terminated. */
  get terminationReason(): string | null {
    return this._terminationReason;
  }

  set terminationReason(value: string | null) {
    this._terminationReason = value;
  }

  /** Termination date as a 'YYYY-MM-DD' string, or null if not terminated. */
  get terminationDate(): string | null {
    return this._terminationDate;
  }

  set terminationDate(value: string | null) {
    this._terminationDate = value;
  }

  /** Identifier of the area the employee works in. */
  get areaId(): number {
    return this._areaId;
  }

  set areaId(value: number) {
    this._areaId = value;
  }

  /** Identifier of the position the employee holds. */
  get positionId(): number {
    return this._positionId;
  }

  set positionId(value: number) {
    this._positionId = value;
  }

  /** Identifier of the employee's direct manager (another employee), or null if none. */
  get directManagerId(): number | null {
    return this._directManagerId;
  }

  set directManagerId(value: number | null) {
    this._directManagerId = value;
  }

  /** Resolved area of the employee, or null if not loaded. */
  get area(): Area | null {
    return this._area;
  }

  set area(value: Area | null) {
    this._area = value;
  }

  /** Resolved position of the employee, or null if not loaded. */
  get position(): Position | null {
    return this._position;
  }

  set position(value: Position | null) {
    this._position = value;
  }

  /** Full name built as 'firstName lastName'. */
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  /** Full address built as 'street, district, province, department'. */
  get fullAddress(): string {
    return `${this._addressStreet}, ${this._addressDistrict}, ${this._addressProvince}, ${this._addressDepartment}`;
  }

  /**
   * Checks whether the employee is currently active.
   *
   * @returns True if the status is 'ACTIVE', false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  /**
   * Checks whether the employee has been terminated.
   *
   * @returns True if the status is 'TERMINATED', false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  isTerminated(): boolean {
    return this._status === 'TERMINATED';
  }

  /**
   * Checks whether the employee reports to a direct manager.
   *
   * @returns True if a direct manager id is set, false otherwise
   * @author Oscar Lizandro Vasquez Llave
   */
  hasDirectManager(): boolean {
    return this._directManagerId !== null;
  }
}
