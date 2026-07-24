import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditAdminListComponent } from './credit-admin-list.component';

describe('CreditAdminListComponent', () => {
  let component: CreditAdminListComponent;
  let fixture: ComponentFixture<CreditAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
