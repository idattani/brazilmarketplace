import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountManagerComponent } from './user-account-manager.component';

describe('UserAccountManagerComponent', () => {
  let component: UserAccountManagerComponent;
  let fixture: ComponentFixture<UserAccountManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAccountManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAccountManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
