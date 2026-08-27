import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentOcrVerificationComponent } from './document-ocr-verification.component';

describe('DocumentOcrVerificationComponent', () => {
  let component: DocumentOcrVerificationComponent;
  let fixture: ComponentFixture<DocumentOcrVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentOcrVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentOcrVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
