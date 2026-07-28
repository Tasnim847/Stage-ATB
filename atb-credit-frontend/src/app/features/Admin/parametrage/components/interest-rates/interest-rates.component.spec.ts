import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestRatesComponent } from './interest-rates.component';

describe('InterestRatesComponent', () => {
  let component: InterestRatesComponent;
  let fixture: ComponentFixture<InterestRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestRatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterestRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
