import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationsComponent } from './durations.component';

describe('DurationsComponent', () => {
  let component: DurationsComponent;
  let fixture: ComponentFixture<DurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
