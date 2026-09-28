import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobAssignmentHistory } from './job-assignment-history';

describe('JobAssignmentHistory', () => {
  let component: JobAssignmentHistory;
  let fixture: ComponentFixture<JobAssignmentHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobAssignmentHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(JobAssignmentHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
