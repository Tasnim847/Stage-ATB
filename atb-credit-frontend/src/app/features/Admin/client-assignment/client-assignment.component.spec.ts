import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientAssignmentComponent } from './client-assignment.component';

describe('ClientAssignmentComponent', () => {
  let component: ClientAssignmentComponent;
  let fixture: ComponentFixture<ClientAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
