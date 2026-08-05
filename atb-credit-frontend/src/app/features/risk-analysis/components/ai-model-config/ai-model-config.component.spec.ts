import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiModelConfigComponent } from './ai-model-config.component';

describe('AiModelConfigComponent', () => {
  let component: AiModelConfigComponent;
  let fixture: ComponentFixture<AiModelConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiModelConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiModelConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
