import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageDashboardComponent } from './parametrage-dashboard.component';

describe('ParametrageDashboardComponent', () => {
  let component: ParametrageDashboardComponent;
  let fixture: ComponentFixture<ParametrageDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametrageDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametrageDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
