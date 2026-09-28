import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterContent } from './footer-content';

describe('FooterContent', () => {
  let component: FooterContent;
  let fixture: ComponentFixture<FooterContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterContent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
