import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactYourAdminComponent } from './contact-your-admin.component';

describe('ContactYourAdminComponent', () => {
  let component: ContactYourAdminComponent;
  let fixture: ComponentFixture<ContactYourAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactYourAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactYourAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
