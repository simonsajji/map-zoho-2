import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewterritoryformComponent } from './newterritoryform.component';

describe('NewterritoryformComponent', () => {
  let component: NewterritoryformComponent;
  let fixture: ComponentFixture<NewterritoryformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewterritoryformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewterritoryformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
