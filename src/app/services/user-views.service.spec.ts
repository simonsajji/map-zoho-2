import { TestBed } from '@angular/core/testing';

import { UserViewsService } from './user-views.service';

describe('UserViewsService', () => {
  let service: UserViewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserViewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
