import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ContractType, Employee, EmploymentStatus, IdentityDocumentType} from '../domain/model/employee.entity';
import {EmployeeResource, EmployeesResponse} from './employees-response';

export class EmployeeAssembler implements BaseAssembler<Employee, EmployeeResource, EmployeesResponse> {

  toEntityFromResource(resource: EmployeeResource): Employee {
    return new Employee({
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      identityDocumentType: resource.identityDocumentType as IdentityDocumentType,
      identityDocumentNumber: resource.identityDocumentNumber,
      birthDate: resource.birthDate,
      email: resource.email,
      phoneNumber: resource.phoneNumber,
      addressStreet: resource.addressStreet,
      addressDistrict: resource.addressDistrict,
      addressProvince: resource.addressProvince,
      addressDepartment: resource.addressDepartment,
      contractType: resource.contractType as ContractType,
      hireDate: resource.hireDate,
      contractEndDate: resource.contractEndDate,
      status: resource.status as EmploymentStatus,
      terminationReason: resource.terminationReason,
      terminationDate: resource.terminationDate,
      areaId: resource.areaId,
      positionId: resource.positionId,
      directManagerId: resource.directManagerId
    });
  }

  toResourceFromEntity(entity: Employee): EmployeeResource {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      identityDocumentType: entity.identityDocumentType,
      identityDocumentNumber: entity.identityDocumentNumber,
      birthDate: entity.birthDate,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      addressStreet: entity.addressStreet,
      addressDistrict: entity.addressDistrict,
      addressProvince: entity.addressProvince,
      addressDepartment: entity.addressDepartment,
      contractType: entity.contractType,
      hireDate: entity.hireDate,
      contractEndDate: entity.contractEndDate,
      status: entity.status,
      terminationReason: entity.terminationReason,
      terminationDate: entity.terminationDate,
      areaId: entity.areaId,
      positionId: entity.positionId,
      directManagerId: entity.directManagerId
    } as EmployeeResource;
  }

  toEntitiesFromResponse(response: EmployeesResponse): Employee[] {
    return response.employees.map(resource => this.toEntityFromResource(resource));
  }
}
