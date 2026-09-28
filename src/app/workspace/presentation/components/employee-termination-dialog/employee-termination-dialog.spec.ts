import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTerminationDialog } from './employee-termination-dialog';

describe('EmployeeTerminationDialog', () => {
  let component: EmployeeTerminationDialog;
  let fixture: ComponentFixture<EmployeeTerminationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTerminationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeTerminationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
