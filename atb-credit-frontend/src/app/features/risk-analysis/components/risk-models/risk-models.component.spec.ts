import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskModelsComponent } from './risk-models.component';

describe('RiskModelsComponent', () => {
  let component: RiskModelsComponent;
  let fixture: ComponentFixture<RiskModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskModelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
