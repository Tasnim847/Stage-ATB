import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalystDashboardComponent } from './analyst-dashboard.component';

describe('AnalystDashboardComponent', () => {
  let component: AnalystDashboardComponent;
  let fixture: ComponentFixture<AnalystDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalystDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalystDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
