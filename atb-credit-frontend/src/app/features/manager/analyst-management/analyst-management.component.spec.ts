import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalystManagementComponent } from './analyst-management.component';

describe('AnalystManagementComponent', () => {
  let component: AnalystManagementComponent;
  let fixture: ComponentFixture<AnalystManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalystManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalystManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
