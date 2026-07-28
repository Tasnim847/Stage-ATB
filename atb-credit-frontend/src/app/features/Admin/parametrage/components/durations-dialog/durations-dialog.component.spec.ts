import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationsDialogComponent } from './durations-dialog.component';

describe('DurationsDialogComponent', () => {
  let component: DurationsDialogComponent;
  let fixture: ComponentFixture<DurationsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DurationsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
