import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskThresholdsComponent } from './risk-thresholds.component';

describe('RiskThresholdsComponent', () => {
  let component: RiskThresholdsComponent;
  let fixture: ComponentFixture<RiskThresholdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskThresholdsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskThresholdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
