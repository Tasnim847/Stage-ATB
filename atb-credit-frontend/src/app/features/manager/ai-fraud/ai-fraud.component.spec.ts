import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiFraudComponent } from './ai-fraud.component';

describe('AiFraudComponent', () => {
  let component: AiFraudComponent;
  let fixture: ComponentFixture<AiFraudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiFraudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiFraudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
