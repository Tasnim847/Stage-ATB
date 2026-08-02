import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatioCalculatorComponent } from './ratio-calculator.component';

describe('RatioCalculatorComponent', () => {
  let component: RatioCalculatorComponent;
  let fixture: ComponentFixture<RatioCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatioCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatioCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
