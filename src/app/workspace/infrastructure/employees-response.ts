import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Resource representing the JSON shape of an employee returned by the API (EmployeeResponse).
 * Enumerated values (document type, contract type, status) are transported as plain strings.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface EmployeeResource extends BaseResource {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  /** Birth date as a 'YYYY-MM-DD' string. */
  birthDate: string;
  email: string;
  phoneNumber: string;
  street: string;
  district: string;
  province: string;
  department: string;
  contractType: string;
  /** Hire date as a 'YYYY-MM-DD' string. */
  hireDate: string;
  /** Contract end date as a 'YYYY-MM-DD' string, or null if indefinite. */
  contractEndDate: string | null;
  status: string;
  terminationReason: string | null;
  /** Termination date as a 'YYYY-MM-DD' string, or null if not terminated. */
  terminationDate: string | null;
  /** Identifier of the employee's area. */
  areaId: number;
  areaName?: string;
  /** Identifier of the employee's position. */
  positionId: number;
  positionTitle?: string;
  /** Identifier of the direct manager (another employee), or null if none. */
  directManagerId: number | null;
}

/** Payload of POST /employees (RegisterEmployeeRequest). */
export interface RegisterEmployeeRequest {
  firstName: string;
  lastName: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  street: string;
  district: string;
  province: string;
  department: string;
  contractType: string;
  hireDate: string;
  contractEndDate?: string;
  areaId: number;
  positionId: number;
  directManagerId?: number;
}

/** Payload of PUT /employees/{id} (UpdateEmployeePersonalDataRequest). */
export interface UpdateEmployeePersonalDataRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  street: string;
  district: string;
  province: string;
  department: string;
}

/** Payload of PUT /employees/{id}/direct-manager (AssignDirectManagerRequest). */
export interface AssignDirectManagerRequest {
  managerId: number;
}

/** Payload of PATCH /employees/{id}/terminate (TerminateEmployeeRequest). */
export interface TerminateEmployeeRequest {
  reason: string;
  terminationDate: string;
}

/** Payload of PATCH /employees/{id}/reinstate (ReinstateEmployeeRequest). */
export interface ReinstateEmployeeRequest {
  areaId: number;
  positionId: number;
  reinstatementDate: string;
}

/** Response wrapper kept for the BaseAssembler contract; the API returns a plain array. */
export interface EmployeesResponse extends BaseResponse {
  employees: EmployeeResource[];
}
