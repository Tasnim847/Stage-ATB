import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditTypesDialogComponent } from './credit-types-dialog.component';

describe('CreditTypesDialogComponent', () => {
  let component: CreditTypesDialogComponent;
  let fixture: ComponentFixture<CreditTypesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditTypesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditTypesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
