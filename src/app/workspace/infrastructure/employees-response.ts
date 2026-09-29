import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface EmployeeResource extends BaseResource {
  id: number;
  firstName: string;
  lastName: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  addressStreet: string;
  addressDistrict: string;
  addressProvince: string;
  addressDepartment: string;
  contractType: string;
  hireDate: string;
  contractEndDate: string | null;
  status: string;
  terminationReason: string | null;
  terminationDate: string | null;
  areaId: number;
  positionId: number;
  directManagerId: number | null;
}

export interface EmployeesResponse extends BaseResponse {
  employees: EmployeeResource[];
}
