import {InjectionToken, Type} from '@angular/core';


export type EmployeeFileSlot = 'employment' | 'aside' | 'attendance-tab' | 'requests-tab' | 'benefits-tab';

export interface EmployeeFileSection {
  slot: EmployeeFileSlot;
  order: number;
  component: Type<unknown>;
}

export const EMPLOYEE_FILE_SECTIONS = new InjectionToken<EmployeeFileSection[]>('EMPLOYEE_FILE_SECTIONS');