import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDocumentList } from './employee-document-list';

describe('EmployeeDocumentList', () => {
  let component: EmployeeDocumentList;
  let fixture: ComponentFixture<EmployeeDocumentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDocumentList],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDocumentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
