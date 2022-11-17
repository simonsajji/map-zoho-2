import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletezoneconfirmComponent } from './deletezoneconfirm.component';

describe('DeletezoneconfirmComponent', () => {
  let component: DeletezoneconfirmComponent;
  let fixture: ComponentFixture<DeletezoneconfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletezoneconfirmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletezoneconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
