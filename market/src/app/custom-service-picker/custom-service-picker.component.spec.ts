import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomServicePickerComponent } from './custom-service-picker.component';

describe('CustomServicePickerComponent', () => {
  let component: CustomServicePickerComponent;
  let fixture: ComponentFixture<CustomServicePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomServicePickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomServicePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
