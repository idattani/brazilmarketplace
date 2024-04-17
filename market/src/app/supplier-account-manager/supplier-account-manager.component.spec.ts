import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierAccountManagerComponent } from './supplier-account-manager.component';

describe('SupplierAccountManagerComponent', () => {
  let component: SupplierAccountManagerComponent;
  let fixture: ComponentFixture<SupplierAccountManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierAccountManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierAccountManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
