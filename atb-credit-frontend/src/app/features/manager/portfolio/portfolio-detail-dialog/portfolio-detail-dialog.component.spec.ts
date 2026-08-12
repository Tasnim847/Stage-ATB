import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioDetailDialogComponent } from './portfolio-detail-dialog.component';

describe('PortfolioDetailDialogComponent', () => {
  let component: PortfolioDetailDialogComponent;
  let fixture: ComponentFixture<PortfolioDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
