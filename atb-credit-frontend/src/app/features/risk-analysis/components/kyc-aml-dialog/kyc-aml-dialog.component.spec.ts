import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycAmlDialogComponent } from './kyc-aml-dialog.component';

describe('KycAmlDialogComponent', () => {
  let component: KycAmlDialogComponent;
  let fixture: ComponentFixture<KycAmlDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycAmlDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycAmlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
