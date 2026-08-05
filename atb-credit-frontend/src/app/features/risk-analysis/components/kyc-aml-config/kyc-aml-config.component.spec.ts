import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycAmlConfigComponent } from './kyc-aml-config.component';

describe('KycAmlConfigComponent', () => {
  let component: KycAmlConfigComponent;
  let fixture: ComponentFixture<KycAmlConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycAmlConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycAmlConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
