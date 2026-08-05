import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionRulesComponent } from './decision-rules.component';

describe('DecisionRulesComponent', () => {
  let component: DecisionRulesComponent;
  let fixture: ComponentFixture<DecisionRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
