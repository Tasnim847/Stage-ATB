import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionRuleDialogComponent } from './decision-rule-dialog.component';

describe('DecisionRuleDialogComponent', () => {
  let component: DecisionRuleDialogComponent;
  let fixture: ComponentFixture<DecisionRuleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionRuleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionRuleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
