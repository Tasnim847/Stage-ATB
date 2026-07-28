import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditTypesComponent } from './credit-types.component';

describe('CreditTypesComponent', () => {
  let component: CreditTypesComponent;
  let fixture: ComponentFixture<CreditTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
