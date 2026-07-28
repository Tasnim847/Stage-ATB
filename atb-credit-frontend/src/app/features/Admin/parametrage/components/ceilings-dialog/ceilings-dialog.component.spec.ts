import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeilingsDialogComponent } from './ceilings-dialog.component';

describe('CeilingsDialogComponent', () => {
  let component: CeilingsDialogComponent;
  let fixture: ComponentFixture<CeilingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeilingsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CeilingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
