import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationUploaderComponent } from './certification-uploader.component';

describe('CertificationUploaderComponent', () => {
  let component: CertificationUploaderComponent;
  let fixture: ComponentFixture<CertificationUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificationUploaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificationUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
