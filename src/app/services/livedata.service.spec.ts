import { TestBed } from '@angular/core/testing';

import { LivedataService } from './livedata.service';

describe('LivedataService', () => {
  let service: LivedataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LivedataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
