import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierSignUpComponent } from './supplier-sign-up.component';

describe('SupplierSignUpComponent', () => {
  let component: SupplierSignUpComponent;
  let fixture: ComponentFixture<SupplierSignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierSignUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierSignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
