import {InjectionToken, Type} from '@angular/core';


/**
 * Places of the employee file (WA-04) and of "My profile" (WA-11) where other bounded contexts add content.
 * - employment: extra row of "Employment information" and "My position".
 * - aside: extra card of the right column.
 * - attendance-tab, requests-tab, benefits-tab: content of those tabs.
 */
export type EmployeeFileSlot = 'employment' | 'aside' | 'attendance-tab' | 'requests-tab' | 'benefits-tab';

/**
 * Component that a bounded context registers in the employee file.
 *
 * @remarks The component must declare employeeId = input.required<number>(); the file only passes that id.
 * @author Oscar Lizandro Vasquez Llave
 */
export interface EmployeeFileSection {
  /** Place of the file where the component is shown. */
  slot: EmployeeFileSlot;
  /** Position among the components of the same slot. */
  order: number;
  /** Component to show. */
  component: Type<unknown>;
}

/**
 * Extension point of the employee file. Each bounded context registers its sections in app.config.ts with multi: true.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
export const EMPLOYEE_FILE_SECTIONS = new InjectionToken<EmployeeFileSection[]>('EMPLOYEE_FILE_SECTIONS');