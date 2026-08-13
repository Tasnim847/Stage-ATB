import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalystPerformanceComponent } from './analyst-performance.component';

describe('AnalystPerformanceComponent', () => {
  let component: AnalystPerformanceComponent;
  let fixture: ComponentFixture<AnalystPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalystPerformanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalystPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
