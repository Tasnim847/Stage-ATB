import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditAdminComponent } from './credit-admin.component';

describe('CreditAdminComponent', () => {
  let component: CreditAdminComponent;
  let fixture: ComponentFixture<CreditAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
