import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalystCreditRequestsComponent } from './analyst-credit-requests.component';

describe('AnalystCreditRequestsComponent', () => {
  let component: AnalystCreditRequestsComponent;
  let fixture: ComponentFixture<AnalystCreditRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalystCreditRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalystCreditRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
