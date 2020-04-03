import { TestBed } from '@angular/core/testing';

import { MeiService } from './mei.service';

describe('MeiService', () => {
  let service: MeiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
