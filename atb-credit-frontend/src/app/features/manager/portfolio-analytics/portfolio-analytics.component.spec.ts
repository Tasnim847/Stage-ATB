import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioAnalyticsComponent } from './portfolio-analytics.component';

describe('PortfolioAnalyticsComponent', () => {
  let component: PortfolioAnalyticsComponent;
  let fixture: ComponentFixture<PortfolioAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
