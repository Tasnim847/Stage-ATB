import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationResultComponent } from './simulation-result.component';

describe('SimulationResultComponent', () => {
  let component: SimulationResultComponent;
  let fixture: ComponentFixture<SimulationResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
