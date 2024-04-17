import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePickerComponent } from './service-picker.component';

describe('ServicePickerComponent', () => {
  let component: ServicePickerComponent;
  let fixture: ComponentFixture<ServicePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicePickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
