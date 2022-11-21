import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteviewComponent } from './routeview.component';

describe('RouteviewComponent', () => {
  let component: RouteviewComponent;
  let fixture: ComponentFixture<RouteviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
