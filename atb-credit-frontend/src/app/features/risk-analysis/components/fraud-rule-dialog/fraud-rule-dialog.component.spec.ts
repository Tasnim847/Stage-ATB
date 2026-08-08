import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraudRuleDialogComponent } from './fraud-rule-dialog.component';

describe('FraudRuleDialogComponent', () => {
  let component: FraudRuleDialogComponent;
  let fixture: ComponentFixture<FraudRuleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraudRuleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraudRuleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
