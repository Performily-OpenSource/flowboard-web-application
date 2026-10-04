import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ContractType, Employee, EmploymentStatus, IdentityDocumentType} from '../domain/model/employee.entity';
import {EmployeeResource, EmployeesResponse} from './employees-response';

/**
 * Assembler that converts between EmployeeResource (API) and Employee (domain entity).
 * String codes are cast to their domain types; resolved area and position are not mapped.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export class EmployeeAssembler implements BaseAssembler<Employee, EmployeeResource, EmployeesResponse> {

  /**
   * Converts a EmployeeResource into a Employee entity.
   *
   * @param resource - The resource returned by the API.
   * @returns The corresponding Employee entity
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Converts a Employee entity into a EmployeeResource to be sent to the API.
   *
   * @param entity - The entity to convert.
   * @returns The corresponding EmployeeResource
   * @author Oscar Lizandro Vasquez Llave
   */
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

  /**
   * Converts a EmployeesResponse into a list of Employee entities.
   *
   * @param response - The response whose 'employees' array is converted.
   * @returns The list of Employee entities
   * @author Oscar Lizandro Vasquez Llave
   */
  toEntitiesFromResponse(response: EmployeesResponse): Employee[] {
    return response.employees.map(resource => this.toEntityFromResource(resource));
  }
}
