import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestRatesDialogComponent } from './interest-rates-dialog.component';

describe('InterestRatesDialogComponent', () => {
  let component: InterestRatesDialogComponent;
  let fixture: ComponentFixture<InterestRatesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestRatesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterestRatesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
