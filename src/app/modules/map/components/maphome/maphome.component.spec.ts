import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaphomeComponent } from './maphome.component';

describe('MaphomeComponent', () => {
  let component: MaphomeComponent;
  let fixture: ComponentFixture<MaphomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaphomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaphomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
