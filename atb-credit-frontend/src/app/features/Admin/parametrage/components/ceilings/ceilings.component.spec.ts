import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeilingsComponent } from './ceilings.component';

describe('CeilingsComponent', () => {
  let component: CeilingsComponent;
  let fixture: ComponentFixture<CeilingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeilingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CeilingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
