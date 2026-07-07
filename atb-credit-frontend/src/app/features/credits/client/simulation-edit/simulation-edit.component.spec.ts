import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationEditComponent } from './simulation-edit.component';

describe('SimulationEditComponent', () => {
  let component: SimulationEditComponent;
  let fixture: ComponentFixture<SimulationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
