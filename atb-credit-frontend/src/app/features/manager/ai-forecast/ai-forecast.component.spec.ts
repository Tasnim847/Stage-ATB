import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiForecastComponent } from './ai-forecast.component';

describe('AiForecastComponent', () => {
  let component: AiForecastComponent;
  let fixture: ComponentFixture<AiForecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiForecastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
