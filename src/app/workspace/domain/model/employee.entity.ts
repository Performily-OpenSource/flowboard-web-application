import {Area} from './area.entity';
import {Position} from './position.entity';

export type IdentityDocumentType = 'DNI' | 'CE' | 'PASSPORT';
export type ContractType = 'INDEFINITE' | 'FIXED_TERM' | 'PART_TIME' | 'INTERNSHIP';
export type EmploymentStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export const IDENTITY_DOCUMENT_TYPES: IdentityDocumentType[] = ['DNI', 'CE', 'PASSPORT'];
export const CONTRACT_TYPES: ContractType[] = ['INDEFINITE', 'FIXED_TERM', 'PART_TIME', 'INTERNSHIP'];
export const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['ACTIVE', 'SUSPENDED', 'TERMINATED'];

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

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    this._firstName = value;
  }

  get lastName(): string {
    return this._lastName;
  }

  set lastName(value: string) {
    this._lastName = value;
  }

  get identityDocumentType(): IdentityDocumentType {
    return this._identityDocumentType;
  }

  set identityDocumentType(value: IdentityDocumentType) {
    this._identityDocumentType = value;
  }

  get identityDocumentNumber(): string {
    return this._identityDocumentNumber;
  }

  set identityDocumentNumber(value: string) {
    this._identityDocumentNumber = value;
  }

  get birthDate(): string {
    return this._birthDate;
  }

  set birthDate(value: string) {
    this._birthDate = value;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  set phoneNumber(value: string) {
    this._phoneNumber = value;
  }

  get addressStreet(): string {
    return this._addressStreet;
  }

  set addressStreet(value: string) {
    this._addressStreet = value;
  }

  get addressDistrict(): string {
    return this._addressDistrict;
  }

  set addressDistrict(value: string) {
    this._addressDistrict = value;
  }

  get addressProvince(): string {
    return this._addressProvince;
  }

  set addressProvince(value: string) {
    this._addressProvince = value;
  }

  get addressDepartment(): string {
    return this._addressDepartment;
  }

  set addressDepartment(value: string) {
    this._addressDepartment = value;
  }

  get contractType(): ContractType {
    return this._contractType;
  }

  set contractType(value: ContractType) {
    this._contractType = value;
  }

  get hireDate(): string {
    return this._hireDate;
  }

  set hireDate(value: string) {
    this._hireDate = value;
  }

  get contractEndDate(): string | null {
    return this._contractEndDate;
  }

  set contractEndDate(value: string | null) {
    this._contractEndDate = value;
  }

  get status(): EmploymentStatus {
    return this._status;
  }

  set status(value: EmploymentStatus) {
    this._status = value;
  }

  get terminationReason(): string | null {
    return this._terminationReason;
  }

  set terminationReason(value: string | null) {
    this._terminationReason = value;
  }

  get terminationDate(): string | null {
    return this._terminationDate;
  }

  set terminationDate(value: string | null) {
    this._terminationDate = value;
  }

  get areaId(): number {
    return this._areaId;
  }

  set areaId(value: number) {
    this._areaId = value;
  }

  get positionId(): number {
    return this._positionId;
  }

  set positionId(value: number) {
    this._positionId = value;
  }

  get directManagerId(): number | null {
    return this._directManagerId;
  }

  set directManagerId(value: number | null) {
    this._directManagerId = value;
  }

  get area(): Area | null {
    return this._area;
  }

  set area(value: Area | null) {
    this._area = value;
  }

  get position(): Position | null {
    return this._position;
  }

  set position(value: Position | null) {
    this._position = value;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get fullAddress(): string {
    return `${this._addressStreet}, ${this._addressDistrict}, ${this._addressProvince}, ${this._addressDepartment}`;
  }

  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  isTerminated(): boolean {
    return this._status === 'TERMINATED';
  }

  hasDirectManager(): boolean {
    return this._directManagerId !== null;
  }
}
