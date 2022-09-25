import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleMapDemoComponent } from './google-map-demo.component';

describe('GoogleMapDemoComponent', () => {
  let component: GoogleMapDemoComponent;
  let fixture: ComponentFixture<GoogleMapDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleMapDemoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleMapDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
