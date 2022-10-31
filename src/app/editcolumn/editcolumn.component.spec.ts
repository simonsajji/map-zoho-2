import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditcolumnComponent } from './editcolumn.component';

describe('EditcolumnComponent', () => {
  let component: EditcolumnComponent;
  let fixture: ComponentFixture<EditcolumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditcolumnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditcolumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
