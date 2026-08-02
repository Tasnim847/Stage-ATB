import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialAnalyzerComponent } from './financial-analyzer.component';

describe('FinancialAnalyzerComponent', () => {
  let component: FinancialAnalyzerComponent;
  let fixture: ComponentFixture<FinancialAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
