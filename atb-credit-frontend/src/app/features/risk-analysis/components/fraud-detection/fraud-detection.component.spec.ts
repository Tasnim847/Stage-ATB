import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraudDetectionComponent } from './fraud-detection.component';

describe('FraudDetectionComponent', () => {
  let component: FraudDetectionComponent;
  let fixture: ComponentFixture<FraudDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraudDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraudDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
