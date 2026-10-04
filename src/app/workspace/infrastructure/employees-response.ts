import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Resource representing the JSON shape of an employee returned by the API.
 * Enumerated values (document type, contract type, status) are transported as plain strings.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export interface EmployeeResource extends BaseResource {
  id: number;
  firstName: string;
  lastName: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  /** Birth date as a 'YYYY-MM-DD' string. */
  birthDate: string;
  email: string;
  phoneNumber: string;
  addressStreet: string;
  addressDistrict: string;
  addressProvince: string;
  addressDepartment: string;
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
  /** Identifier of the employee's position. */
  positionId: number;
  /** Identifier of the direct manager (another employee), or null if none. */
  directManagerId: number | null;
}

/** Response wrapper returned by the API when the employees are listed inside an 'employees' property. */
export interface EmployeesResponse extends BaseResponse {
  employees: EmployeeResource[];
}
